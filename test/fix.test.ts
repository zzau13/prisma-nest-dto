import { describe, test } from 'vitest';

import { testFixtures } from './fixtures';

describe('fixtures', () => {
  const FIXTURES = 'fixtures/basic/**/*.prisma';
  test(FIXTURES, testFixtures(FIXTURES));
});
