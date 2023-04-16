# Config file

In the configuration file, you can define a list of customization rules for your models and their fields.
Each rule consists of an optional regular expression to target specific Prisma model names, and a list of field customizations.
Each field customization includes a regular expression to match desired field names within the targeted model, and decorators to be applied to the matched field.

The priority order for applying these regular expressions and decorators is determined by the order in which they appear in the list.
The first match found or the one defined in the Prisma schema will be used.

By leveraging this configuration structure, you can create a more flexible and powerful configuration for your models and fields,
applying decorators as needed for custom functionality and validation.

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
        { regex: /mail$/, decorators: '@IsEmail() @Length(200)' },
      ],
    },
  ],
});
```
