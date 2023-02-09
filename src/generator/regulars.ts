import { DMMF } from '@prisma/generator-helper';

import { Config } from '../config';
import { isRelation } from './field-classifiers';

// TODO: by parent name
export function regulars(field: DMMF.Field, regulars: Config['regulars']) {
  let doc = field.documentation ?? '';
  const relation = isRelation(field);
  for (const regular of regulars)
    if (
      (regular.relations === undefined || regular.relations === relation) &&
      regular.regex.test(field.name)
    )
      doc += '\n' + regular.decorators;

  return doc;
}
