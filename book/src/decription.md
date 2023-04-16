## What is it?

Generates `ConnectDTO`, `CreateDTO`, `UpdateDTO`, and `Entity` classes for models in your Prisma Schema. This is useful if you want to leverage [OpenAPI](https://docs.nestjs.com/openapi/introduction) in your [NestJS](https://nestjs.com/) application - but also helps with GraphQL resources as well). NestJS Swagger requires input parameters in [controllers to be described through classes](https://docs.nestjs.com/openapi/types-and-parameters) because it leverages TypeScript's emitted metadata and `Reflection` to generate models/components for the OpenAPI spec. It does the same for response models/components on your controller methods.

These classes can also be used with the built-in [ValidationPipe](https://docs.nestjs.com/techniques/validation#using-the-built-in-validationpipe) and [Serialization](https://docs.nestjs.com/techniques/serialization).
