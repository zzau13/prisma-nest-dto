# Prisma Schema Decorators

Prisma schema decorators allow you to create dto and entities.
You can use them with `///` comments or by configuring them directly in the Prisma schema file.
This guide focuses on `class-validator` decorators and additional Prisma decorators that can be
used for generating DTOs and entities.

## Class-validator Decorators

Class-validator decorators are also available for use in Prisma schemas.
For a comprehensive list of class-validator decorators, refer to the
[official class-validator documentation](https://github.com/typestack/class-validator#validation-decorators).

## Additional Prisma Decorators

- `@Ignore`: Ignores the decorated property in all generated DTOs and can be used on both models and fields.
- `@NoAdd`: Ignores the decorated property in the generated create DTO.
- `@NoSet`: Ignores the decorated property in the generated update DTO.
- `@OptAdd`: Makes the decorated property optional in the generated create DTO.
- `@OptSet`: Makes the decorated property optional in the generated update DTO.
- `@NoEntity`: Excludes the decorated field from the generated entity.

- `@RReq`: Makes the decorated relation required in the all generated DTO.
- [`@RAddOnAdd`][add]: Makes the additional class for create when create
- [`@RLnOnAdd`][link]: Makes the additional class for connect when create
- [`@RAddOnSet`][add]: Makes the additional class for create when update
- [`@RLnOnSet`][link]: Makes the additional class for connect when update
- Add `@RAddOn` and `@RLnOn` for [connect or create][linkOrAdd]

All additional Prisma decorators can be used on fields, and the `@Ignore` decorator can be used on both models and fields.

## Configuring Decorators

Decorators can be configured using the [configuration file](./config.md) or [Prisma schema config](./options) or by adding them directly in the schema.

### Using `///` Comments

```prisma
model User {
  id    Int    @id @default(autoincrement())
  /// @NoSet @IsEmail()
  email String
}

/// @Ignore
model Ignored {
  id Int @id @default(autoincrement())
}
```

[add]: https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#nested-writes
[link]: https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#connect-an-existing-record
[linkOrAdd]: https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#connect-or-create-a-record
