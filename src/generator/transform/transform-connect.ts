import { isId, isUnique } from '../field-classifiers';
import { Help, Model } from '../help';

export function transformConnect({
  model,
  help,
}: {
  model: Model;
  help: Help;
}) {
  // Is in connect
  const fields = model.fields.filter(
    (field) => isId(field, model.primaryKey) || isUnique(field),
  );

  return { model, fields, imports: help.addImports(fields) };
}
