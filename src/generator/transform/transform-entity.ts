import path from 'node:path';

import { Ann } from '../annotations';
import { isAnnotatedWith, isRelation, isRequired } from '../field-classifiers';
import type { FieldOverride, Imports, ParsedField } from '../types';
import { Help, getRelationScalars, getRelativePath, slash } from '../help';
import { Model } from '../model';

export function transformEntity({
  model,
  allModels,
  help,
}: {
  model: Model;
  allModels: Model[];
  help: Help;
}) {
  const imports: Imports[] = [];
  const apiExtraModels: string[] = [];

  const relationScalarFields = getRelationScalars(model.fields);
  const relationScalarFieldNames = Object.keys(relationScalarFields);

  const fields = model.fields.reduce((result, field) => {
    const { name } = field;
    const overrides: FieldOverride = {
      isRequired: true,
      isNullable: !field.isRequired,
    };

    if (isAnnotatedWith(field, Ann.NO_ENTITY)) return result;

    // relation fields are never required in an entity.
    // they can however be `selected` and thus might optionally be present in the
    // response from PrismaClient
    if (isRelation(field)) {
      overrides.isRequired = false;
      overrides.isNullable = field.isList
        ? false
        : field.isRequired
          ? false
          : !isAnnotatedWith(field, Ann.DTO_RELATION_REQUIRED);

      // don't try to import the class we're preparing params for
      if (field.type !== model.name) {
        const modelToImportFrom = allModels.find(
          ({ name }) => name === field.type,
        );

        if (!modelToImportFrom)
          throw new Error(
            `related model '${field.type}' for '${model.name}.${field.name}' not found`,
          );

        const importName = help.entityName(field.type);
        const importFrom = slash(
          `${getRelativePath(
            model.output.entity,
            modelToImportFrom.output.entity,
          )}${path.sep}${help.entityFilename(field.type)}`,
        );

        // don't double-import the same thing
        // TODO should check for match on any import name ( - no matter where from)
        if (
          !imports.some(
            (item) =>
              Array.isArray(item.destruct) &&
              item.destruct.includes(importName) &&
              item.from === importFrom,
          )
        ) {
          imports.push({
            destruct: [importName],
            from: importFrom,
          });
        }
      }
    }

    if (relationScalarFieldNames.includes(name)) {
      const { [name]: relationNames } = relationScalarFields;
      const isAnyRelationRequired = relationNames.some((relationFieldName) => {
        const relationField = model.fields.find(
          (anyField) => anyField.name === relationFieldName,
        );
        if (!relationField) return false;

        return (
          isRequired(relationField) ||
          isAnnotatedWith(relationField, Ann.DTO_RELATION_REQUIRED)
        );
      });

      overrides.isRequired = true;
      overrides.isNullable = !isAnyRelationRequired;
    }

    return [...result, { ...field, ...overrides }];
  }, [] as ParsedField[]);

  imports.push({
    from: help.nestImport(),
    destruct: ['IntersectionType'].concat(
      fields.find((x) => x.kind === 'enum') ? ['ApiProperty'] : [],
    ),
  });
  return {
    model,
    fields,
    imports: help.addImports(fields, imports, apiExtraModels),
    apiExtraModels,
  };
}
