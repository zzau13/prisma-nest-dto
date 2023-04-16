const validateNested = {
  name: 'ValidateNested',
  code: '@ValidateNested()',
  import: 'ValidateNested',
} as const;
export const decoRelated = [validateNested] as const;

const optional = {
  name: 'IsOptional',
  code: '@IsOptional()',
  import: 'IsOptional',
} as const;
export const decoNotRequired = [optional] as const;
