import { isId, isUnique } from '../field-classifiers';
import { mapDMMFToParsedField, uniq } from '../helpers';

import type { DMMF } from '@prisma/generator-helper';
import type { ConnectDtoParams } from '../types';

interface ComputeConnectDtoParamsParam {
  model: DMMF.Model;
}
// TODO: various connects using unique fields
export const computeConnectDtoParams = ({
  model,
}: ComputeConnectDtoParamsParam): ConnectDtoParams => {
  const idFields = model.fields.filter((field) =>
    isId(field, model.primaryKey),
  );
  const isUniqueFields = model.fields.filter((field) => isUnique(field));

  /**
   * @ApiProperty({
   *  type: 'array',
   *  items: {
   *    oneOf: [{ $ref: getSchemaPath(A) }, { $ref: getSchemaPath(B) }],
   *  },
   * })
   * connect?: (A | B)[];
   */
  // TODO consider adding documentation block to model that one of the properties must be provided
  const uniqueFields = uniq([...idFields, ...isUniqueFields]);
  const overrides = uniqueFields.length > 1 ? { isRequired: false } : {};
  const fields = uniqueFields.map((field) =>
    mapDMMFToParsedField(field, overrides),
  );

  return { model, fields };
};
