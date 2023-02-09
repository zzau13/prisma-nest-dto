import { generatorHandler } from '@prisma/generator-helper';
import { generate } from './generate';

generatorHandler({
  onManifest: () => ({
    defaultOutput: '../src/generated/nestjs-dto',
    prettyName: 'NestJS DTO Generator',
  }),
  onGenerate: generate,
});

export { defConfig } from './config';
