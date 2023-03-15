# TODO: Please help me

# Config file

```javascript
const { defConfig } = require('prisma-generator-nestjs');

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
```
