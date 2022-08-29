# Refactor roadmap and priority

- ~~Fix unused model fields (ids, uniques,..) when generate~~
- ~~Refactor generated classes with composition~~
- ~~Add extension.{entity,dto}.ts files for implement complex structures~~
- ~~Add per model index and default reexport~~
- ~~Refactor decimal.js to number and use hard cast from prisma client return type~~
- ~~Use @babel for parse comments like "COMMENT class {}" and extract decorator from ast~~
- Add https://docs.nestjs.com/graphql/mapped-types support with config
- Simplify comment annotations and remove boilerplate
- Add support for class-validator ~~by comment~~, by name, (in future by @db annotations)
- Create various dto depending on index fields
- Clean Code and simplify structure
- Add Documentation and clean README.md
- Coverage e2e
- ~100% coverage

# Prisma Generator NestJS [![npm version](https://badge.fury.io/js/prisma-generator-nestjs.svg)](https://www.npmjs.com/package/prisma-generator-nestjs) [![codecov](https://codecov.io/gh/botika/prisma-generator-nestjs-dto/branch/main/graph/badge.svg?token=HIJKP2ENHQ)](https://codecov.io/gh/botika/prisma-generator-nestjs-dto)

## License

All files are released under the [Apache License 2.0](https://github.com/vegardit/prisma-generator-nestjs-dto/blob/master/LICENSE).
This project is a fork from [https://github.com/vegardit/prisma-generator-nestjs-dto](https://github.com/vegardit/prisma-generator-nestjs-dto)
