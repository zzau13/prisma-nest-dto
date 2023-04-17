import * as deco from 'class-validator/cjs/decorator/decorators';
import { parseExpression } from '@babel/parser';
import generate from '@babel/generator';
import { logger } from '@prisma/internals';

export enum Ct {
  TYPE = 'Type',
}

export enum Ann {
  IGNORE = 'Ignore',
  NO_SET = 'NoSet',
  NO_ADD = 'NoAdd',
  NO_ENTITY = 'NoEntity',
  OPT_ADD = 'OptAdd',
  OPT_SET = 'OptSet',
  // TODO: add more specific coverage and wrap
  DTO_RELATION_REQUIRED = 'RReq',
  DTO_RELATION_CAN_CREATE_ON_CREATE = 'RAddOnAdd',
  DTO_RELATION_CAN_CONNECT_ON_CREATE = 'RLnOnAdd',
  DTO_RELATION_CAN_CREATE_ON_UPDATE = 'RAddOnSet',
  DTO_RELATION_CAN_CONNECT_ON_UPDATE = 'RLnOnSet',
  // TODO: rest of https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#nested-writes
}
export const IsAnn = (s: string): s is Ann =>
  Object.values(Ann).includes(s as Ann);

export const DTO_RELATION_MODIFIERS_ON_CREATE = [
  Ann.DTO_RELATION_CAN_CREATE_ON_CREATE,
  Ann.DTO_RELATION_CAN_CONNECT_ON_CREATE,
];
export const DTO_RELATION_MODIFIERS_ON_UPDATE = [
  Ann.DTO_RELATION_CAN_CREATE_ON_UPDATE,
  Ann.DTO_RELATION_CAN_CONNECT_ON_UPDATE,
];

const DECO: readonly string[] = Object.keys(deco).filter((x) =>
  /^[A-Z][a-z]/.test(x),
);

export const isDecoCt = (x: string) => Object.values(Ct).includes(x as Ct);
export const isDecoValidator = (x: string) => DECO.includes(x);
export const isDecoCalled = (x: string) => isDecoValidator(x) || isDecoCt(x);

export function annotate(doc?: string) {
  const ret = [];
  if (doc) {
    const parsed = parseExpression(`${doc} class {}`, {
      plugins: ['decorators-legacy'],
    });
    if (parsed.type !== 'ClassExpression')
      throw new Error('error parsing decorators');

    const has = new Set();

    // TODO: Annotations
    if (parsed.decorators)
      for (const x of parsed.decorators)
        if (
          x.type === 'Decorator' &&
          x.expression.type === 'CallExpression' &&
          x.expression.callee.type === 'Identifier' &&
          isDecoCalled(x.expression.callee.name)
        ) {
          const name = x.expression.callee.name;
          if (!has.has(name)) {
            has.add(name);
            ret.push({
              name,
              code: generate(x).code,
              import: name,
              importPath: isDecoCt(name)
                ? ('class-transformer' as const)
                : ('class-validator' as const),
            });
          } else {
            logger.warn(`Duplicated decorator @${name}`);
          }
        } else if (
          x.expression.type === 'Identifier' &&
          IsAnn(x.expression.name)
        ) {
          const name = x.expression.name;
          if (!has.has(name)) {
            has.add(name);
            ret.push({ name });
          } else {
            logger.warn(`Duplicated decorator @${name}`);
          }
        } else throw new Error(`not valid decorator ${generate(x).code}`);
  }
  return ret as ReadonlyArray<(typeof ret)[number]>;
}
