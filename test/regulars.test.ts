import { testFixtures } from './fixtures';

testFixtures('fixtures/regulars.prisma', {
  // Priority by first schema and order, take the first
  regulars: [
    {
      models: /^User$/,
      fields: [{ regex: /password$/, decorators: '@Length(16)' }],
    },
    {
      fields: [
        { regex: /password$/, decorators: '@Length(8)' },
        { regex: /mail$/, decorators: '@IsEmail() @IsString()' },
      ],
    },
  ],
});
