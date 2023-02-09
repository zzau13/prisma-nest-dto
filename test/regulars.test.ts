import { testFixtures } from './fixtures';

testFixtures('fixtures/regulars.prisma', {
  regulars: [
    {
      regex: /mail$/,
      decorators: '@IsEmail() @IsString()',
    },
  ],
});
