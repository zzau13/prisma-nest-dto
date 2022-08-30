import type { DMMF } from '@prisma/generator-helper';

import { isId, isUnique } from '../field-classifiers';
import { mapDMMFToParsedField, uniq } from '../helpers';

import { Imports } from '../types';
import { Help } from '../help';

export function transformConnect({
  model,
  help,
}: {
  model: DMMF.Model;
  help: Help;
}) {
  const idFields = model.fields.filter((field) =>
    isId(field, model.primaryKey),
  );
  const isUniqueFields = model.fields.filter((field) => isUnique(field));

  // Imports
  const imports: Imports[] = [];
  const fields = uniq([...idFields, ...isUniqueFields]).map((x) =>
    mapDMMFToParsedField(x),
  );
  if (fields.find((x) => x.kind === 'enum')) {
    const destruct = [];
    destruct.push('ApiProperty');
    imports.unshift({ from: help.nestImport(), destruct });
  }

  help.addImports(fields, imports);

  return { model, fields, imports };
}
