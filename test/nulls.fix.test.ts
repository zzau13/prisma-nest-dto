import { describe, test } from 'vitest';

import { testFixtures } from './fixtures';

describe('fixtures', () => {
  const BASIC = 'fixtures/nulls.prisma';
  test(BASIC, testFixtures(BASIC));
});
