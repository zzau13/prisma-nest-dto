import path from 'node:path';
import type { DMMF } from '@prisma/generator-helper';
import { parseExpression } from '@babel/parser';
import generate from '@babel/generator';

import { isAnnotatedWith } from './field-classifiers';
import type { Imports, ParsedField } from './types';
import { Ann, IsAnn, IsDecoValidator } from './annotations';
import { Options } from '../options';
import { camel, kebab, pascal, snake } from 'case';
import { Config } from '../config';
import { regulars } from './regulars';
import { logger } from '@prisma/internals';

function slash(path: string) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path); // eslint-disable-line no-control-regex

  if (isExtendedLengthPath || hasNonAscii) {
    return path;
  }

  return path.replace(/\\/g, '/');
}

const validateNested = {
  name: 'ValidateNested',
  code: '@ValidateNested()',
  import: 'ValidateNested',
} as const;
const decoRelated = [validateNested];

export const uniq = <T = unknown>(input: T[]): T[] =>
  Array.from(new Set(input));

export const concatIntoArray = <T = unknown>(source: T[], target: T[]) =>
  source.forEach((item) => target.push(item));

export function annotate(doc?: string) {
  const ret = [];
  if (doc) {
    const parsed = parseExpression(`${doc} class {}`, {
      plugins: ['decorators-legacy'],
    });
    if (parsed.type !== 'ClassExpression')
      throw new Error('error parsing decorators');

    const has = new Set();

    // TODO: Annotations
    if (parsed.decorators)
      for (const x of parsed.decorators)
        if (
          x.type === 'Decorator' &&
          x.expression.type === 'CallExpression' &&
          x.expression.callee.type === 'Identifier' &&
          IsDecoValidator(x.expression.callee.name)
        ) {
          const name = x.expression.callee.name;
          if (!has.has(name)) {
            has.add(name);
            ret.push({
              name,
              code: generate(x).code,
              import: x.expression.callee.name,
            });
          } else {
            logger.warn(`Duplicated decorator @${name}`);
          }
        } else if (
          x.expression.type === 'Identifier' &&
          IsAnn(x.expression.name)
        ) {
          const name = x.expression.name;
          if (!has.has(name)) {
            has.add(name);
            ret.push({ name });
          } else {
            logger.warn(`Duplicated decorator @${name}`);
          }
        } else throw new Error(`not valid decorator ${generate(x).code}`);
  }
  return ret;
}

export const transformers: Record<
  Options['fileNamingStyle'],
  (str: string) => string
> = {
  camel,
  kebab,
  pascal,
  snake,
};

export type Model = ReturnType<typeof getModels>[number];
export const getModels = (
  models: DMMF.Model[],
  { outputToNestJsResourceStructure, output, fileNamingStyle }: Options,
  config: Config,
) =>
  models
    .map((model) => ({ ...model, annotations: annotate(model.documentation) }))
    .filter((x) => !isAnnotatedWith(x, Ann.IGNORE))
    .map((model) => ({
      ...model,
      fields: model.fields.map((x) => ({
        ...x,
        annotations: annotate(regulars(x, config.regulars)).concat(
          x.kind === 'object' ? decoRelated : [],
        ),
      })),
      output: {
        dto: outputToNestJsResourceStructure
          ? path.join(output, transformers[fileNamingStyle](model.name), 'dto')
          : output,
        entity: outputToNestJsResourceStructure
          ? path.join(
              output,
              transformers[fileNamingStyle](model.name),
              'entities',
            )
          : output,
      },
    }));

export const getImportsDeco = (parsed: ParsedField[]): Imports | undefined => {
  const destruct = uniq(
    parsed
      .flatMap((x) => x.annotations)
      .filter((x) => x.import)
      .flatMap((x) => x.import as string),
  );

  if (destruct.length)
    return {
      from: 'class-validator',
      destruct,
    };
};

export const getRelationScalars = (
  fields: DMMF.Field[],
): Record<string, string[]> => {
  const scalars = fields.flatMap(
    ({ relationFromFields = [] }) => relationFromFields,
  );

  return scalars.reduce(
    (result, scalar) => ({
      ...result,
      [scalar]: fields
        .filter(({ relationFromFields = [] }) =>
          relationFromFields.includes(scalar),
        )
        .map(({ name }) => name),
    }),
    {} as Record<string, string[]>,
  );
};

export const getRelativePath = (from: string, to: string) => {
  const result = slash(path.relative(from, to));
  return result || '.';
};

export const generateRelationInput = ({
  field,
  model,
  allModels,
  templateHelpers: t,
  preAndSuffixClassName,
  canCreateAnnotation,
  canConnectAnnotation,
}: {
  field: ParsedField;
  model: Model;
  allModels: Model[];
  templateHelpers: Help;
  preAndSuffixClassName: Help['createDtoName'] | Help['updateDtoName'];
  canCreateAnnotation: Ann;
  canConnectAnnotation: Ann;
}) => {
  const relationInputClassProps: Array<Pick<ParsedField, 'name' | 'type'>> = [];

  const imports: Imports[] = [];
  const apiExtraModels: string[] = [];
  const generatedClasses: string[] = [];

  if (isAnnotatedWith(field, canCreateAnnotation)) {
    const preAndPostfixesName = t.createDtoName(field.type);
    apiExtraModels.push(preAndPostfixesName);

    const modelToImportFrom = allModels.find(({ name }) => name === field.type);

    if (!modelToImportFrom)
      throw new Error(
        `related model '${field.type}' for '${model.name}.${field.name}' not found`,
      );

    imports.push({
      from: slash(
        `${getRelativePath(model.output.dto, modelToImportFrom.output.dto)}${
          path.sep
        }${t.createDtoFilename(field.type)}`,
      ),
      destruct: [preAndPostfixesName],
    });

    relationInputClassProps.push({
      name: 'create',
      type: preAndPostfixesName,
    });
  }

  if (isAnnotatedWith(field, canConnectAnnotation)) {
    const preAndPostfixesName = t.connectDtoName(field.type);
    apiExtraModels.push(preAndPostfixesName);
    const modelToImportFrom = allModels.find(({ name }) => name === field.type);

    if (!modelToImportFrom)
      throw new Error(
        `related model '${field.type}' for '${model.name}.${field.name}' not found`,
      );

    imports.push({
      from: slash(
        `${getRelativePath(model.output.dto, modelToImportFrom.output.dto)}${
          path.sep
        }${t.connectDtoFilename(field.type)}`,
      ),
      destruct: [preAndPostfixesName],
    });

    relationInputClassProps.push({
      name: 'connect',
      type: preAndPostfixesName,
    });
  }

  if (!relationInputClassProps.length) {
    throw new Error(
      `Can not find relation input props for '${model.name}.${field.name}'`,
    );
  }

  const originalInputClassName = `${t.transformClassNameCase(
    model.name,
  )}${t.transformClassNameCase(field.name)}RelationInput`;

  const preAndPostfixesInputClassName = preAndSuffixClassName(
    originalInputClassName,
  );
  generatedClasses.push(`class ${preAndPostfixesInputClassName} {
    ${t.fieldsToDtoProps(
      relationInputClassProps.map((inputField) => ({
        ...inputField,
        annotations: decoRelated,
        kind: 'relation-input',
        isRequired: relationInputClassProps.length === 1,
        isList: field.isList,
      })),
      true,
    )}
  }`);

  apiExtraModels.push(preAndPostfixesInputClassName);

  return {
    type: preAndPostfixesInputClassName,
    imports,
    generatedClasses,
    apiExtraModels,
  };
};

export const mergeImportStatements = (
  first: Imports,
  second: Imports,
): Imports => {
  if (first.from !== second.from) {
    throw new Error(
      `Can not merge import statements; 'from' parameter is different`,
    );
  }

  if (first.default && second.default) {
    throw new Error(
      `Can not merge import statements; both statements have set the 'default' property`,
    );
  }

  const firstDestruct = first.destruct || [];
  const secondDestruct = second.destruct || [];
  const destructStrings = uniq(
    [...firstDestruct, ...secondDestruct].filter(
      (destructItem) => typeof destructItem === 'string',
    ),
  );

  const destructObject = [...firstDestruct, ...secondDestruct].reduce(
    (result: Record<string, string>, destructItem) => {
      if (typeof destructItem === 'string') return result;

      return { ...result, ...destructItem };
    },
    {} as Record<string, string>,
  );

  return {
    ...first,
    ...second,
    destruct: [...destructStrings, destructObject],
  };
};

export const zipImportStatementParams = (items: Imports[]): Imports[] => {
  const itemsByFrom = items.reduce((result, item) => {
    const { from } = item;
    const { [from]: existingItem } = result;
    if (!existingItem) {
      return { ...result, [from]: item };
    }
    return { ...result, [from]: mergeImportStatements(existingItem, item) };
  }, {} as Record<Imports['from'], Imports>);

  return Object.values(itemsByFrom);
};

const PrismaScalarToTypeScript = (decimalAsNumber: boolean) =>
  ({
    String: 'string',
    Boolean: 'boolean',
    Int: 'number',
    // [Working with BigInt](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields#working-with-bigint)
    BigInt: 'bigint',
    Float: 'number',
    // [Working with Decimal](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields#working-with-decimal)
    Decimal: decimalAsNumber ? 'number' : 'Prisma.Decimal',
    DateTime: 'Date',
    // [working with JSON fields](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields)
    Json: 'Prisma.JsonValue',
    // [Working with Bytes](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields#working-with-bytes)
    Bytes: 'Buffer',
  } as const);

const _scalarToTS = (table: ReturnType<typeof PrismaScalarToTypeScript>) => {
  const knownPrismaScalarTypes = Object.keys(table);
  return (scalar: string, useInputTypes = false): string => {
    if (!knownPrismaScalarTypes.includes(scalar)) {
      throw new Error(`Unrecognized scalar type: ${scalar}`);
    }

    // [Working with JSON fields](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields)
    // supports different types for input / output. `Prisma.InputJsonValue` extends `Prisma.JsonValue` with `undefined`
    if (useInputTypes && scalar === 'Json') {
      return 'Prisma.InputJsonValue';
    }

    return table[scalar as keyof typeof table];
  };
};

export const echo = (input: string) => input;

export const when = (
  condition: unknown,
  thenTemplate: string,
  elseTemplate = '',
) => (condition ? thenTemplate : elseTemplate);

export const unless = (
  condition: unknown,
  thenTemplate: string,
  elseTemplate = '',
) => (!condition ? thenTemplate : elseTemplate);

declare global {
  interface Array<T> {
    each(fn: (item: T) => string, joinWith: string): string;
  }
}

Array.prototype.each = function (fn, joinWith = '') {
  return this.map(fn).join(joinWith);
};

const importStatement = (input: Imports) => {
  const { from, destruct = [], default: defaultExport } = input;
  const fragments = ['import'];
  if (defaultExport) {
    if (typeof defaultExport === 'string') {
      fragments.push(defaultExport);
    } else {
      fragments.push(`* as ${defaultExport['*']}`);
    }
  }
  if (destruct.length) {
    if (defaultExport) {
      fragments.push(',');
    }
    fragments.push(
      `{${destruct.flatMap((item) => {
        if (typeof item === 'string') return item;
        return Object.entries(item).map(([key, value]) => `${key} as ${value}`);
      })}}`,
    );
  }

  fragments.push(`from '${from}'`);

  return fragments.join(' ');
};

const importStatements = (items: Imports[]) =>
  `${items.each(importStatement, '\n')}`;

export const makeHelpers = ({
  connectDtoPrefix,
  createDtoPrefix,
  updateDtoPrefix,
  dtoSuffix,
  entityPrefix,
  entitySuffix,
  decimalAsNumber,
  mode,
  fileNamingStyle,
}: Options) => {
  const transformFileNameCase = transformers[fileNamingStyle];
  const transformClassNameCase = pascal;

  const className = (name: string, prefix = '', suffix = '') =>
    `${prefix}${transformClassNameCase(name)}${suffix}`;
  const fileName = (
    name: string,
    prefix = '',
    suffix = '',
    withExtension = false,
  ) =>
    `${prefix}${transformFileNameCase(name)}${suffix}${when(
      withExtension,
      '.ts',
    )}`;

  const entityName = (name: string) =>
    className(name, entityPrefix, entitySuffix);
  const connectDtoName = (name: string) =>
    className(name, connectDtoPrefix, dtoSuffix);
  const createDtoName = (name: string) =>
    className(name, createDtoPrefix, dtoSuffix);
  const updateDtoName = (name: string) =>
    className(name, updateDtoPrefix, dtoSuffix);

  const connectDtoFilename = (name: string, withExtension = false) =>
    fileName(name, 'connect-', '.dto', withExtension);

  const createDtoFilename = (name: string, withExtension = false) =>
    fileName(name, 'create-', '.dto', withExtension);

  const updateDtoFilename = (name: string, withExtension = false) =>
    fileName(name, 'update-', '.dto', withExtension);

  const entityFilename = (name: string, withExtension = false) =>
    fileName(name, undefined, '.entity', withExtension);
  const scalarToTS = _scalarToTS(PrismaScalarToTypeScript(decimalAsNumber));

  const fieldType = (field: ParsedField, toInputType = false) =>
    `${
      field.kind === 'scalar'
        ? scalarToTS(field.type, toInputType)
        : field.kind === 'enum' || field.kind === 'relation-input'
        ? field.type
        : entityName(field.type)
    }${when(field.isList, '[]')}`;

  const fieldToDtoProp = (
    field: ParsedField,
    useInputTypes = false,
    forceOptional = false,
  ) => {
    const annotations = field.annotations
      .filter((x) => x.code)
      .map((x) => x.code)
      .join('\n');
    return `${when(
      field.kind === 'enum',
      `@ApiProperty({ enum: ${fieldType(field, useInputTypes)}})\n`,
    )}${when(annotations, annotations + '\n')}${field.name}${unless(
      field.isRequired && !forceOptional,
      '?',
    )}: ${fieldType(field, useInputTypes)};`;
  };

  const fieldsToDtoProps = (
    fields: ParsedField[],
    useInputTypes = false,
    forceOptional = false,
  ) =>
    `  ${fields.each(
      (field) => fieldToDtoProp(field, useInputTypes, forceOptional),
      '\n  ',
    )}`;

  const fieldToEntityProp = (field: ParsedField, useInputTypes = false) => {
    const annotations = field.annotations
      .filter((x) => x.code)
      .map((x) => x.code)
      .join('\n');
    return `${when(
      field.kind === 'enum',
      `@ApiProperty({ enum: ${fieldType(field, useInputTypes)}})\n`,
    )}${when(annotations, annotations + '\n')}${field.name}${unless(
      field.isRequired,
      '?',
    )}: ${fieldType(field)} ${when(field.isNullable, ' | null')};`;
  };

  const fieldsToEntityProps = (fields: ParsedField[]) =>
    `  ${fields.each((field) => fieldToEntityProp(field), '\n  ')}`;

  const apiExtraModels = (names: string[]) =>
    `@ApiExtraModels(${names.map(entityName)})`;

  /*'@nestjs/graphql'*/
  let imports = '';
  if (mode === 'openapi') imports = '@nestjs/swagger';
  else throw new Error('unimplemented graphql support');
  const nestImport = () => imports;
  const makeImportsFromPrismaClient = (
    fields: ParsedField[],
  ): Imports | null => {
    const enumsToImport = uniq(
      fields.filter(({ kind }) => kind === 'enum').map(({ type }) => type),
    );
    const importPrisma = fields
      .filter(({ kind }) => kind === 'scalar')
      .some(({ type }) => scalarToTS(type).includes('Prisma'));

    if (!(enumsToImport.length || importPrisma)) {
      return null;
    }

    return {
      from: '@prisma/client',
      destruct: importPrisma ? ['Prisma', ...enumsToImport] : enumsToImport,
    };
  };

  return {
    addImports(
      fields: ParsedField[],
      imports: Imports[] = [],
      extraModels: string[] = [],
    ) {
      const hasEnum = !!fields.find((x) => x.kind === 'enum');
      if (extraModels.length || hasEnum) {
        const destruct = [];
        if (extraModels.length) destruct.push('ApiExtraModels');
        if (hasEnum) destruct.push('ApiProperty');
        imports.unshift({ from: this.nestImport(), destruct });
      }

      const importDeco = getImportsDeco(fields);
      if (importDeco) imports.push(importDeco);

      const importPrismaClient = makeImportsFromPrismaClient(fields);
      if (importPrismaClient) imports.unshift(importPrismaClient);
      return zipImportStatementParams(imports).sort(
        ({ from: a }, { from: b }) => b.localeCompare(a),
      );
    },
    config: {
      connectDtoPrefix,
      createDtoPrefix,
      updateDtoPrefix,
      dtoSuffix,
      entityPrefix,
      entitySuffix,
    } as const,
    apiExtraModels,
    connectDtoFilename,
    connectDtoName,
    createDtoFilename,
    createDtoName,
    echo,
    entityFilename,
    entityName,
    fieldToDtoProp,
    fieldToEntityProp,
    fieldType,
    fieldsToDtoProps,
    fieldsToEntityProps,
    if: when,
    importStatements,
    nestImport,
    scalarToTS,
    transformClassNameCase,
    transformFileNameCase,
    unless,
    updateDtoFilename,
    updateDtoName,
    when,
  } as const;
};

export type Help = ReturnType<typeof makeHelpers>;
