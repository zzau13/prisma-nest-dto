import { describe, test } from 'vitest';

import { testFixtures } from './fixtures';

describe('fixtures', () => {
  const BASIC = 'fixtures/arr-id.prisma';
  test(BASIC, testFixtures(BASIC));
});
