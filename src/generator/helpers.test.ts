import { describe, it, test, expect } from 'vitest';
import { mapDMMFToParsedField } from './helpers';
import type { DMMF } from '@prisma/generator-helper';
import { ParsedField } from './types';

describe('map DMMF.Field to ParsedField', () => {
  const field: DMMF.Field = {
    name: 'a',
    kind: 'scalar',
    type: 'string',
    documentation: '@IsUUID("4")',
    isRequired: false,
    isUnique: false,
    isUpdatedAt: false,
    isList: false,
    isId: false,
    isReadOnly: false,
    isGenerated: false,
    hasDefaultValue: false,
  };

  const overrides = { name: 'b' };

  it('overrides "name" property', () => {
    const parsedField = mapDMMFToParsedField(field, overrides);
    expect(parsedField.name).toBe(overrides.name);
    expect(parsedField.decorators[0].import).toBe('IsUUID');
    expect(parsedField.decorators[0].code).toBe('@IsUUID("4")');
  });

  test('preserves all other properties from "field"', () => {
    const parsedField = mapDMMFToParsedField(field, overrides);
    Object.keys(field)
      .filter((key) => key !== 'name')
      .forEach((key) => {
        expect(parsedField[key as keyof ParsedField]).toBe(field[key]);
      });
  });
});
