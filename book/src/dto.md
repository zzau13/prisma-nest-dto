### ConnectDTO

This kind of DTO represents the structure of input-data to expect from 'outside' (e.g. REST API consumer) when attempting to `connect` to a model through a relation field.

A `Model`s `ConnectDTO` class is composed from a unique'd list of `isId` and `isUnique` scalar fields. If the `ConnectDTO` class has exactly one property, the property is marked as required. If there are more than one properties, all properties are optional (since setting a single one of them is already sufficient for a unique query) - you must however specify at least one property.

`ConnectDTO`s are used for relation fields in `CreateDTO`s and `UpdateDTO`s.

### CreateDTO

[annotations](#annotations) that generate corresponding input properties on `CreateDTO` and `UpdateDTO` (optional or required - depending on the nature of the relation).

When generating a `Model`s `CreateDTO` class, field that meet any of the following conditions are omitted (**order matters**):

- `isReadOnly` OR is annotated with `@NoSet` (_Note:_ this apparently includes relation scalar fields)
- field represents a relation (`field.kind === 'object'`) and is not annotated with `@DtoRelationCanCreateOnCreate` or `@DtoRelationCanConnectOnCreate`
- field is a [relation scalar](https://www.prisma.io/docs/concepts/components/prisma-schema/relations/#annotated-relation-fields-and-relation-scalar-fields)
- field is not annotated with `@OptAdd` AND
  - `isId && hasDefaultValue` (id fields are not supposed to be provided by the user)
  - `isUpdatedAt` ([Prisma](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#updatedat) will inject value)
  - `isRequired && hasDefaultValue` (for schema-required fields that fallback to a default value when empty. Think: `createdAt` timestamps with `@default(now())` (see [now()](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#now)))

### UpdateDTO

When generating a `Model`s `UpdateDTO` class, field that meet any of the following conditions are omitted (**order matters**):

- field is annotated with `@OptSet`
- `isReadOnly` OR is annotated with `@NoSet` (_Note:_ this apparently includes relation scalar fields)
- `isId` (id fields are not supposed to be updated by the user)
- field represents a relation (`field.kind === 'object'`) and is not annotated with `@DtoRelationCanCreateOnUpdate` or `@DtoRelationCanConnectOnUpdate`
- field is a [relation scalar](https://www.prisma.io/docs/concepts/components/prisma-schema/relations/#annotated-relation-fields-and-relation-scalar-fields)
- field is not annotated with `@OptSet` AND
  - `isId` (id fields are not supposed to be updated by the user)
  - `isUpdatedAt` ([Prisma](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#updatedat) will inject value)
  - `isRequired && hasDefaultValue` (for schema-required fields that fallback to a default value when empty. Think: `createdAt` timestamps with `@default(now())` (see [now()](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#now)))
