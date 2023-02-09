// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defConfig } = require('./dist');

module.exports = defConfig({
  regulars: [{ regex: /mail$/, decorators: '@IsEmail() @IsString()' }],
});
