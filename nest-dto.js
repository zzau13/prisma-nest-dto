// eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
const { defConfig } = require('./dist');

// eslint-disable-next-line no-undef
module.exports = defConfig({
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
