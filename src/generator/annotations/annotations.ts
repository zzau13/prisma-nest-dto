import * as deco from 'class-validator/cjs/decorator/decorators';

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
export const IsDecoValidator = (x: string) => DECO.includes(x);
