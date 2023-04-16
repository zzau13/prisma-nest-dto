# Extension

For each of the `__extension.entity.ts` files, it is important to note that these files are generated only once
and will never be overwritten. This ensures that any customizations or modifications made to these files
are preserved throughout the development process.

To extend the functionality of your models, you can make use of Mapped Types provided by NestJS. Mapped Types
are utility functions that allow you to create new types based on existing ones, simplifying the process of
creating and managing related types within your application.

The main Mapped Types provided by NestJS include:

1. **[PartialType](https://docs.nestjs.com/openapi/mapped-types#partialtype)**: Generates a new type by making all properties of the original type optional. This is particularly useful when handling partial updates or creating DTOs (Data Transfer Objects) for update operations.

2. **[PickType](https://docs.nestjs.com/openapi/mapped-types#picktype)**: Generates a new type by selecting a subset of properties from the original type. This can be useful for creating DTOs that require only specific properties from a larger model.

3. **[OmitType](https://docs.nestjs.com/openapi/mapped-types#omittype)**: Generates a new type by excluding a set of properties from the original type. This is helpful when creating DTOs that exclude certain properties from a model, such as sensitive information or internal fields.

4. **[IntersectionType](https://docs.nestjs.com/openapi/mapped-types#intersectiontype)**: Generates a new type by combining two existing types, allowing you to create composite DTOs that include properties from multiple sources.

By utilizing these Mapped Types, you can simplify the creation and management of related types in your application, improving the overall developer experience. For more information and examples, refer to the [official NestJS Mapped Types documentation](https://docs.nestjs.com/openapi/mapped-types).

NestJS respects and integrates with the `class-validator` library, allowing you to leverage its powerful validation capabilities in your application. With `class-validator`, you can easily add validation rules to your DTOs (Data Transfer Objects) by using decorators on the properties of your classes.

When using Mapped Types provided by NestJS, such as `PartialType`, `PickType`, `OmitType`, and `IntersectionType`, the validation rules defined by `class-validator` will be preserved and applied to the resulting types.

For more information on how NestJS works with `class-validator` and examples of using validation decorators, refer to the [official NestJS Validation documentation](https://docs.nestjs.com/techniques/validation).
