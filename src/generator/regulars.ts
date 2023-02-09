import { DMMF } from '@prisma/generator-helper';

import { Config } from '../config';

// TODO: by parent name
export function regulars(field: DMMF.Field, regulars: Config['regulars']) {
  let doc = field.documentation ?? '';
  for (const regular of regulars)
    if (regular.regex.test(field.name)) doc += '\n' + regular.decorators;

  return doc;
}
