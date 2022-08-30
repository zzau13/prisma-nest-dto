import type { DMMF } from '@prisma/generator-helper';

import { isId, isUnique } from '../field-classifiers';
import { parseDMMF, Help } from '../help';

export function transformConnect({
  model,
  help,
}: {
  model: DMMF.Model;
  help: Help;
}) {
  // Is in connect
  const fields = model.fields
    .filter((field) => isId(field, model.primaryKey) || isUnique(field))
    .map(parseDMMF);

  return { model, fields, imports: help.addImports(fields) };
}
