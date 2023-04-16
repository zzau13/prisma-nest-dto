# Quick start

## Install

```sh
pnpm add -D prisma-generator-nestjs
```

## Add Prisma schema generator

```prisma
generator nestjsDto {
  provider = "prisma-generator-nestjs"
  output   = "../src/lib/model"
}
```
