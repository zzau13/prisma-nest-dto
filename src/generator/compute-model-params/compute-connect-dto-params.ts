import { isId, isUnique } from '../field-classifiers';
import { makeImportsFromPrismaClient, uniq } from '../helpers';

import type { DMMF } from '@prisma/generator-helper';
import { ImportStatementParams } from '../types';
import { TemplateHelpers } from '../template-helpers';

export const computeConnectDtoParams = ({
  model,
  templateHelpers,
}: {
  model: DMMF.Model;
  templateHelpers: TemplateHelpers;
}) => {
  const idFields = model.fields.filter((field) =>
    isId(field, model.primaryKey),
  );
  const isUniqueFields = model.fields.filter((field) => isUnique(field));

  const imports: ImportStatementParams[] = [];
  const fields = uniq([...idFields, ...isUniqueFields]);
  if (fields.find((x) => x.kind === 'enum')) {
    const destruct = [];
    destruct.push('ApiProperty');
    imports.unshift({ from: '@nestjs/swagger', destruct });
  }

  const importPrismaClient = makeImportsFromPrismaClient(
    fields,
    templateHelpers,
  );
  if (importPrismaClient) imports.push(importPrismaClient);

  return { model, fields, imports };
};
