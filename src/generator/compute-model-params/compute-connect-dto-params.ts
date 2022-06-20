import { isId, isUnique } from '../field-classifiers';
import { uniq } from '../helpers';

import type { DMMF } from '@prisma/generator-helper';

export const computeConnectDtoParams = ({ model }: { model: DMMF.Model }) => {
  const idFields = model.fields.filter((field) =>
    isId(field, model.primaryKey),
  );
  const isUniqueFields = model.fields.filter((field) => isUnique(field));
  return { model, fields: uniq([...idFields, ...isUniqueFields]) };
};
