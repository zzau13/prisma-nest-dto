import * as deco from 'class-validator/cjs/decorator/decorators';

export enum Ann {
  IGNORE = 'Ignore',
  NO_SET = 'NoSet',
  NO_ADD = 'NoAdd',
  NO_ENTITY = 'NoEntity',
  OPT_ADD = 'OptAdd',
  OPT_SET = 'OptSet',
  DTO_RELATION_REQUIRED = 'DtoRelationRequired',
  DTO_RELATION_CAN_CREATE_ON_CREATE = 'DtoRelationCanCreateOnCreate',
  DTO_RELATION_CAN_CONNECT_ON_CREATE = 'DtoRelationCanConnectOnCreate',
  DTO_RELATION_CAN_CREATE_ON_UPDATE = 'DtoRelationCanCreateOnUpdate',
  DTO_RELATION_CAN_CONNECT_ON_UPDATE = 'DtoRelationCanConnectOnUpdate',
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
