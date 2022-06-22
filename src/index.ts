import fs from 'node:fs/promises';
import path from 'node:path';
import makeDir from 'make-dir';
import { generatorHandler } from '@prisma/generator-helper';
import { parseEnvValue } from '@prisma/sdk';

import { run } from './generator';

import type { GeneratorOptions } from '@prisma/generator-helper';
import type { WriteableFileSpecs, NamingStyle } from './generator/types';

export const stringToBoolean = (input: string, defaultValue = false) => {
  if (input === 'true') {
    return true;
  }
  if (input === 'false') {
    return false;
  }

  return defaultValue;
};

export const generate = (options: GeneratorOptions) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const output = parseEnvValue(options.generator.output!);

  const {
    connectDtoPrefix = 'Connect',
    createDtoPrefix = 'Create',
    updateDtoPrefix = 'Update',
    dtoSuffix = 'Dto',
    entityPrefix = '',
    entitySuffix = '',
    fileNamingStyle = 'kebab',
  } = options.generator.config;

  const decimalAsNumber = stringToBoolean(
    options.generator.config.decimalAsNumber,
    false,
  );
  const exportRelationModifierClasses = stringToBoolean(
    options.generator.config.exportRelationModifierClasses,
    true,
  );

  const outputToNestJsResourceStructure = stringToBoolean(
    options.generator.config.outputToNestJsResourceStructure,
    false,
  );

  const supportedFileNamingStyles = ['kebab', 'camel', 'pascal', 'snake'];
  const isSupportedFileNamingStyle = (style: string): style is NamingStyle =>
    supportedFileNamingStyles.includes(style);

  if (!isSupportedFileNamingStyle(fileNamingStyle)) {
    throw new Error(
      `'${fileNamingStyle}' is not a valid file naming style. Valid options are ${supportedFileNamingStyles
        .map((s) => `'${s}'`)
        .join(', ')}.`,
    );
  }

  const results = run({
    output,
    dmmf: options.dmmf,
    exportRelationModifierClasses,
    outputToNestJsResourceStructure,
    connectDtoPrefix,
    createDtoPrefix,
    updateDtoPrefix,
    dtoSuffix,
    entityPrefix,
    entitySuffix,
    fileNamingStyle,
    decimalAsNumber,
  });

  const indexCollections: Record<string, WriteableFileSpecs> = {};

  results.forEach(({ fileName }) => {
    const dirName = path.dirname(fileName);
    const parentDir = path.dirname(dirName);

    const { [dirName]: fileSpec } = indexCollections;
    indexCollections[dirName] = {
      fileName: fileSpec?.fileName || path.join(dirName, 'index.ts'),
      content: [
        fileSpec?.content || "export * from './__extension.entity';",
        `export * from './${path.basename(fileName, '.ts')}';`,
      ].join('\n'),
    };

    if (!indexCollections[parentDir])
      indexCollections[parentDir] = {
        fileName: path.join(parentDir, 'index.ts'),
        content:
          "export * from './__extension.entity';\nexport * from './dto';\nexport * from './entities';\n",
      };
  });

  const extensionsCollections = Object.values(indexCollections).map(
    ({ fileName }) => ({
      content: 'export {};\n',
      fileName: path.join(path.dirname(fileName), '__extension.entity.ts'),
    }),
  );

  return Promise.all(
    results
      .concat(Object.values(indexCollections))
      .map(async ({ fileName, content }) => {
        await makeDir(path.dirname(fileName));
        return fs.writeFile(fileName, content);
      })
      .concat(
        extensionsCollections.map(async ({ fileName, content }) => {
          if (!(await fs.stat(fileName).catch(() => false))) {
            await makeDir(path.dirname(fileName));
            return fs.writeFile(fileName, content);
          }
        }),
      ),
  );
};

generatorHandler({
  onManifest: () => ({
    defaultOutput: '../src/generated/nestjs-dto',
    prettyName: 'NestJS DTO Generator',
  }),
  onGenerate: generate,
});
