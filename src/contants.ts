const makeDeco = (name: string) =>
  ({
    name: name,
    code: `@${name}()`,
    import: name,
    importPath: 'class-validator' as const,
  }) as const;

export const decoRelated = (type: string) => [
  {
    name: type,
    code: `@Type(() => ${type})`,
    import: 'Type',
    importPath: 'class-transformer' as const,
  },
  makeDeco('ValidateNested'),
];

export const decoNotRequired = [makeDeco('IsOptional')] as const;
export const decoIsDateString = [makeDeco('IsDateString')] as const;
