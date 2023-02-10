import { testFixtures } from './fixtures';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('../nest-dto.js');

testFixtures('fixtures/regulars.prisma', config);
