## Usage?

```sh
pnpm add -D prisma-generator-nestjs
```

```prisma
generator nestjsDto {
  // Prisma global
  provider = "prisma-generator-nestjs"
  output   = "../src/model"

  // File config path
  fileConfig = "nest-dto.js"

  // Dto Prefix 
  connectDtoPrefix = "Connect"
  createDtoPrefix  = "Create"
  updateDtoPrefix  = "Update"
  // Suffix
  dtoSuffix        = "Dto"
  entityPrefix     = ""
  entitySuffix     = ""

  // Style file naming
  fileNamingStyle = "kebab"
  // Transform Prisma.Decimal to number
  decimalAsNumber = "false"
  // Import path for prisma
  importPath      = "@prisma/client"

  // Class validator auto generator
  // @IsOptional() when not is required field
  cvIsOptional   = "true"
  // @IsDateString() DataTime types
  cvIsDateString = "true"

  // Use prettier to format your file
  prettier = "true"
  // Only "openapi" mode
  mode     = "openapi"

  // deprecated: remove in favor of one structure
  outputToNestJsResourceStructure = "true"
  exportRelationModifierClasses   = "true"
}
```
