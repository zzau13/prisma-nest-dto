import fs from 'node:fs/promises';
import path from 'node:path';
import makeDir from 'make-dir';
import { GeneratorOptions } from '@prisma/generator-helper';

import { run } from './generator';
import { parseOptions } from './options';

export const completeFiles = (results: ReturnType<typeof run>) => {
  const indexCollections: Record<string, ReturnType<typeof run>[number]> = {};
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
