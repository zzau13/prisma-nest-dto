import fs from 'node:fs/promises';
import path from 'node:path';
import makeDir from 'make-dir';
import { EnvValue } from '@prisma/generator-helper';
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

export const parseOptions = ({
  generator: { config, output },
  dmmf,
}: Pick<GeneratorOptions, 'dmmf' | 'generator'>) => {
  const parsedOutput = output ? parseEnvValue(output) : '';
  const {
    connectDtoPrefix = 'Connect',
    createDtoPrefix = 'Create',
    updateDtoPrefix = 'Update',
    dtoSuffix = 'Dto',
    entityPrefix = '',
    entitySuffix = '',
    fileNamingStyle = 'kebab',
  } = config;

  const decimalAsNumber = stringToBoolean(config.decimalAsNumber, false);
  const exportRelationModifierClasses = stringToBoolean(
    config.exportRelationModifierClasses,
    true,
  );

  const outputToNestJsResourceStructure = stringToBoolean(
    config.outputToNestJsResourceStructure,
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

  return {
    connectDtoPrefix,
    createDtoPrefix,
    decimalAsNumber,
    dmmf,
    dtoSuffix,
    entityPrefix,
    entitySuffix,
    exportRelationModifierClasses,
    fileNamingStyle,
    output: parsedOutput,
    outputToNestJsResourceStructure,
    updateDtoPrefix,
  };
};

export const completeFiles = (results: ReturnType<typeof run>) => {
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

  return results
    .concat(Object.values(indexCollections))
    .map((x) => ({ ...x, override: true }))
    .concat(extensionsCollections.map((x) => ({ ...x, override: false })));
};

const writeFiles = (files: ReturnType<typeof completeFiles>) =>
  Promise.all(
    files.map(async ({ fileName, content, override }) => {
      if (override || !(await fs.stat(fileName).catch(() => false))) {
        await makeDir(path.dirname(fileName));
        return fs.writeFile(fileName, content);
      }
    }),
  );

export const generate = (options: GeneratorOptions) => {
  const parsedOptions = parseOptions(options);
  const results = run(parsedOptions);
  const final = completeFiles(results);

  return writeFiles(final);
};
