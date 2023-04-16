import { Ann, DTO_RELATION_MODIFIERS_ON_CREATE } from '../annotations';
import {
  isAnnotatedWith,
  isAnnotatedWithOneOf,
  isIdWithDefaultValue,
  isRelation,
  isRequiredWithDefaultValue,
  isUpdatedAt,
} from '../field-classifiers';

import type { DMMF } from '@prisma/generator-helper';
import { Help, concatIntoArray, generateRelationInput } from '../help';
import type { Imports, ParsedField } from '../types';
import { Model } from '../model';

export function transformCreate({
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
  const extraClasses: string[] = [];

  const fields = model.fields.reduce((result, field) => {
    if (isAnnotatedWith(field, Ann.NO_ADD)) return result;
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
        canCreateAnnotation: Ann.DTO_RELATION_CAN_CREATE_ON_CREATE,
        canConnectAnnotation: Ann.DTO_RELATION_CAN_CONNECT_ON_CREATE,
      });

      const isDtoRelationRequired = isAnnotatedWith(
        field,
        Ann.DTO_RELATION_REQUIRED,
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

    const isDtoOptional = isAnnotatedWith(field, Ann.OPT_ADD);
    if (!isDtoOptional) {
      if (isIdWithDefaultValue(field, model.primaryKey)) return result;
      if (isUpdatedAt(field)) return result;
    }
    if (isDtoOptional) overrides.isRequired = false;

    if (isRequiredWithDefaultValue(field)) overrides.isRequired = false;

    return [...result, { ...field, ...overrides }];
  }, [] as ParsedField[]);

  return {
    model,
    fields,
    imports: help.addImports(fields, imports, apiExtraModels),
    extraClasses,
    apiExtraModels,
  };
}
