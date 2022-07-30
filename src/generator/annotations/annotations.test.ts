import { describe, expect, it } from 'vitest';
import { IsDecoValidator } from './annotations';

describe('Annotations spec', () => {
  it('should class-validator', () => {
    expect(IsDecoValidator('IsUUID')).toBeTruthy();
  });
});
