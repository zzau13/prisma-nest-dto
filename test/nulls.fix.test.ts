import { describe, test } from 'vitest';

import { testFixtures } from './fixtures';

describe('fixtures', () => {
  const FIXTURES = 'fixtures/nulls.prisma';
  test(FIXTURES, testFixtures(FIXTURES));
});
