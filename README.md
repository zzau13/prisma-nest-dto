# Refactor roadmap and priority

- ~~Fix unused model fields (ids, uniques,..) when generate~~
- ~~Refactor generated classes with composition~~
- ~~Add extension.{entity,dto}.ts files for implement complex structures~~
- ~~Add per model index and default reexport~~
- ~~Refactor decimal.js to number and use hard cast from prisma client return type~~
- ~~Use @babel for parse comments like "COMMENT class {}" and extract decorator from ast~~
- ~~Add Documentation and clean README.md~~
- ~~Add support for class-validator by comment, by name,~~ (in future by @db annotations)
- ~~Add config regulars: put decorators in fields by regex of its name~~ and its parent
- Simplify comment annotations and remove boilerplate
- Create various dto depending on index fields
- Clean Code and simplify structure
- Prettify and complete documentation
- ~100% coverage
- Coverage e2e
- Add https://docs.nestjs.com/graphql/mapped-types support with config

# Prisma Generator NestJS [![npm version](https://badge.fury.io/js/prisma-generator-nestjs.svg)](https://www.npmjs.com/package/prisma-generator-nestjs) [![codecov](https://codecov.io/gh/botika/prisma-generator-nestjs-dto/branch/main/graph/badge.svg?token=HIJKP2ENHQ)](https://codecov.io/gh/botika/prisma-generator-nestjs-dto) [![Netlify Status](https://api.netlify.com/api/v1/badges/5506fb1e-286c-4834-adae-9e3c967f294b/deploy-status)](https://app.netlify.com/sites/prisma-generator-nestjs/deploys)

## [Documentation](https://prisma-generator-nestjs.netlify.app/)

## License

All files are released under the [Apache License 2.0](./LICENSE)

Fork from [https://github.com/vegardit/prisma-generator-nestjs-dto](https://github.com/vegardit/prisma-generator-nestjs-dto)
