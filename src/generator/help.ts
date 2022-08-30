import { Imports, ParsedField } from './types';
import { getImportsDeco, uniq, zipImportStatementParams } from './helpers';

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
  transformClassNameCase = echo,
  transformFileNameCase = echo,
  decimalAsNumber,
  mode = 'openapi',
}: {
  connectDtoPrefix: string;
  createDtoPrefix: string;
  updateDtoPrefix: string;
  dtoSuffix: string;
  entityPrefix: string;
  entitySuffix: string;
  transformClassNameCase?: (item: string) => string;
  transformFileNameCase?: (item: string) => string;
  decimalAsNumber: boolean;
  mode?: 'openapi' | 'graphql';
}) => {
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
  ) =>
    `${when(
      field.kind === 'enum',
      `@ApiProperty({ enum: ${fieldType(field, useInputTypes)}})\n`,
    )}${when(
      !!field.decorators.length,
      field.decorators.map((x) => x.code).join('\n') + '\n',
    )}${field.name}${unless(
      field.isRequired && !forceOptional,
      '?',
    )}: ${fieldType(field, useInputTypes)};`;

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
    return `${when(
      field.kind === 'enum',
      `@ApiProperty({ enum: ${fieldType(field, useInputTypes)}})\n`,
    )}${when(
      !!field.decorators.length,
      field.decorators.map((x) => x.code).join('\n') + '\n',
    )}${field.name}${unless(field.isRequired, '?')}: ${fieldType(field)} ${when(
      field.isNullable,
      ' | null',
    )};`;
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
      return zipImportStatementParams(imports);
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
