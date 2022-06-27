import { describe, test } from 'vitest';

import { testFixtures } from './fixtures';

describe('fixtures', () => {
  const FIXTURES = 'fixtures/FIXTURES/**/*.prisma';
  test(FIXTURES, testFixtures(FIXTURES));
});
