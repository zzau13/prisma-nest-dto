import { describe, test } from 'vitest';

import { testFixtures } from './fixtures';

describe('fixtures', () => {
  const BASIC = 'fixtures/basic/**/*.prisma';
  test(BASIC, testFixtures(BASIC));
});
