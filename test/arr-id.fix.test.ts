import { describe, test } from 'vitest';

import { testFixtures } from './fixtures';

describe('fixtures', () => {
  const FIXTURES = 'fixtures/arr-id.prisma';
  test(FIXTURES, testFixtures(FIXTURES));
});
