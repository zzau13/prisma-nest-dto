import {
  NO_ADD,
  DTO_CREATE_OPTIONAL,
  DTO_RELATION_CAN_CONNECT_ON_CREATE,
  DTO_RELATION_CAN_CRAEATE_ON_CREATE,
  DTO_RELATION_MODIFIERS_ON_CREATE,
  DTO_RELATION_REQUIRED,
} from '../annotations';
import {
  isAnnotatedWith,
  isAnnotatedWithOneOf,
  isIdWithDefaultValue,
  isRelation,
  isRequiredWithDefaultValue,
  isUpdatedAt,
} from '../field-classifiers';
import {
  concatIntoArray,
  generateRelationInput,
  mapDMMFToParsedField,
  zipImportStatementParams,
} from '../helpers';

import type { DMMF } from '@prisma/generator-helper';
import type { Help } from '../help';
import type { Model, CreateDtoParams, Imports, ParsedField } from '../types';

export function transformCreate({
  model,
  allModels,
  help,
}: {
  model: Model;
  allModels: Model[];
  help: Help;
}): CreateDtoParams {
  let hasEnum = false;
  const imports: Imports[] = [];
  const apiExtraModels: string[] = [];
  const extraClasses: string[] = [];

  const fields = model.fields.reduce((result, field) => {
    if (isAnnotatedWith(field, NO_ADD)) return result;
    const overrides: Partial<DMMF.Field> = {};

    if (isRelation(field)) {
      if (!isAnnotatedWithOneOf(field, DTO_RELATION_MODIFIERS_ON_CREATE)) {
        return result;
      }
      const relationInputType = generateRelationInput({
        field,
        model,
        allModels,
        templateHelpers: help,
        preAndSuffixClassName: help.createDtoName,
        canCreateAnnotation: DTO_RELATION_CAN_CRAEATE_ON_CREATE,
        canConnectAnnotation: DTO_RELATION_CAN_CONNECT_ON_CREATE,
      });

      const isDtoRelationRequired = isAnnotatedWith(
        field,
        DTO_RELATION_REQUIRED,
      );
      if (isDtoRelationRequired) overrides.isRequired = true;

      // list fields can not be required
      // TODO maybe throw an error if `isDtoRelationRequired` and `isList`
      if (field.isList) overrides.isRequired = false;

      overrides.type = relationInputType.type;
      // since relation input field types are translated to something like { connect: Foo[] }, the field type itself is not a list anymore.
      // You provide list input in the nested `connect` or `create` properties.
      overrides.isList = false;
      concatIntoArray(relationInputType.imports, imports);
      concatIntoArray(relationInputType.generatedClasses, extraClasses);
      concatIntoArray(relationInputType.apiExtraModels, apiExtraModels);
    }

    const isDtoOptional = isAnnotatedWith(field, DTO_CREATE_OPTIONAL);
    if (!isDtoOptional) {
      if (isIdWithDefaultValue(field, model.primaryKey)) return result;
      if (isUpdatedAt(field)) return result;
    }
    if (isDtoOptional) overrides.isRequired = false;

    if (isRequiredWithDefaultValue(field)) overrides.isRequired = false;

    if (field.kind === 'enum') hasEnum = true;

    return [...result, mapDMMFToParsedField(field, overrides)];
  }, [] as ParsedField[]);

  if (apiExtraModels.length || hasEnum) {
    const destruct = [];
    if (apiExtraModels.length) destruct.push('ApiExtraModels');
    if (hasEnum) destruct.push('ApiProperty');
    imports.unshift({ from: help.nestImport(), destruct });
  }

  help.addImports(fields, imports);

  return {
    model,
    fields,
    imports: zipImportStatementParams(imports),
    extraClasses,
    apiExtraModels,
  };
}
