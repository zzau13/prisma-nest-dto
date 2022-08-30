import { DMMF } from '@prisma/generator-helper';

import {
  DTO_RELATION_CAN_CONNECT_ON_UPDATE,
  DTO_RELATION_CAN_CRAEATE_ON_UPDATE,
  DTO_RELATION_MODIFIERS_ON_UPDATE,
  DTO_UPDATE_OPTIONAL,
  NO_SET,
} from '../annotations';
import {
  isAnnotatedWith,
  isAnnotatedWithOneOf,
  isId,
  isReadOnly,
  isRelation,
  isUpdatedAt,
} from '../field-classifiers';
import {
  concatIntoArray,
  generateRelationInput,
  getRelationScalars,
  parseDMMF,
  Help,
} from '../help';
import type { Model, Imports, ParsedField } from '../types';

export function transformUpdate({
  model,
  allModels,
  help,
}: {
  model: Model;
  allModels: Model[];
  help: Help;
}) {
  const imports: Imports[] = [];
  const extraClasses: string[] = [];
  const apiExtraModels: string[] = [];

  const relationScalarFields = getRelationScalars(model.fields);
  const relationScalarFieldNames = Object.keys(relationScalarFields);

  const fields = model.fields.reduce((result, field) => {
    if (
      isId(field, model.primaryKey) ||
      isReadOnly(field) ||
      isAnnotatedWith(field, NO_SET)
    )
      return result;

    const { name, isRequired } = field;
    const overrides: Partial<DMMF.Field> = {
      isNullable: !isRequired,
      isRequired: false,
    };

    if (isRelation(field)) {
      if (!isAnnotatedWithOneOf(field, DTO_RELATION_MODIFIERS_ON_UPDATE)) {
        return result;
      }
      const relationInputType = generateRelationInput({
        field,
        model,
        allModels,
        templateHelpers: help,
        preAndSuffixClassName: help.updateDtoName,
        canCreateAnnotation: DTO_RELATION_CAN_CRAEATE_ON_UPDATE,
        canConnectAnnotation: DTO_RELATION_CAN_CONNECT_ON_UPDATE,
      });

      overrides.type = relationInputType.type;
      overrides.isList = false;

      concatIntoArray(relationInputType.imports, imports);
      concatIntoArray(relationInputType.generatedClasses, extraClasses);
      concatIntoArray(relationInputType.apiExtraModels, apiExtraModels);
    }
    if (relationScalarFieldNames.includes(name)) return result;

    // fields annotated with @NoSet are filtered out before this
    // so this safely allows to mark fields that are required in Prisma Schema
    // as **not** required in UpdateDTO
    const isDtoOptional = isAnnotatedWith(field, DTO_UPDATE_OPTIONAL);

    // TODO
    if (isDtoOptional) return result;
    else if (isId(field, model.primaryKey)) overrides.isRequired = true;

    if (isUpdatedAt(field)) return result;

    result.push({ ...parseDMMF(field), ...overrides });

    return result;
  }, [] as ParsedField[]);

  return {
    model,
    fields,
    imports: help.addImports(fields, imports, apiExtraModels),
    extraClasses,
    apiExtraModels,
  };
}
