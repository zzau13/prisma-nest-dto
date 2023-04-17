import { describe, expect, it } from 'vitest';
import { isDecoValidator } from './annotations';

describe('Annotations spec', () => {
  it('should class-validator', () => {
    expect(isDecoValidator('IsUUID')).toBeTruthy();
  });
});
