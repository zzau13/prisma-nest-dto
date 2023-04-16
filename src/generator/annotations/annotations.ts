import * as deco from 'class-validator/cjs/decorator/decorators';

export enum Ann {
  IGNORE = 'Ignore',
  NO_SET = 'NoSet',
  NO_ADD = 'NoAdd',
  NO_ENTITY = 'NoEntity',
  OPT_ADD = 'OptAdd',
  OPT_SET = 'OptSet',
}

export const IsAnn = (s: string): s is Ann =>
  Object.values(Ann).includes(s as Ann);

const DECO: readonly string[] = Object.keys(deco).filter((x) =>
  /^[A-Z][a-z]/.test(x),
);
export const IsDecoValidator = (x: string) => DECO.includes(x);
