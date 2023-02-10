// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defConfig } = require('./dist');

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
