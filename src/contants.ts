const makeDeco = (name: string) =>
  [
    {
      name: name,
      code: `@${name}()`,
      import: name,
    } as const,
  ] as const;

export const decoRelated = makeDeco('ValidateNested');

export const decoNotRequired = makeDeco('IsOptional');
export const decoIsDateString = makeDeco('IsDateString');
