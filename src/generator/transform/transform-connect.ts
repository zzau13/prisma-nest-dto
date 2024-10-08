import { isId, isUnique } from '../field-classifiers';
import { Help } from '../help';
import { Model } from '../model';

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
  const imports = help.addImports(fields);

  return { model, fields, imports };
}
