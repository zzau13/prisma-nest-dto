import fs from 'node:fs/promises';
import path from 'node:path';
import makeDir from 'make-dir';
import { GeneratorOptions } from '@prisma/generator-helper';

import { run } from './generator';
import { Options, parseOptions } from './options';
import { getConfigFile } from './config';

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

async function writeFiles(
  files: ReturnType<typeof completeFiles>,
  { prettier }: Options,
) {
  let format: (str: string) => string;
  if (prettier) {
    const prettier = await import('prettier');
    const configPath = await prettier.resolveConfigFile();
    let config: Awaited<ReturnType<typeof prettier.resolveConfig>> = null;
    try {
      if (configPath) config = await prettier.resolveConfig(configPath);
    } catch (_e) {}
    format = (src: string) =>
      prettier.format(src, { parser: 'babel-ts', ...config });
  } else {
    format = (str) => str;
  }

  return await Promise.all(
    files.map(async ({ fileName, content, override }) => {
      if (override || !(await fs.stat(fileName).catch(() => false))) {
        await makeDir(path.dirname(fileName));
        return fs.writeFile(fileName, format(content));
      }
    }),
  );
}

export async function generate(options: GeneratorOptions) {
  const parsedOptions = parseOptions(options);
  const config = await getConfigFile(parsedOptions.fileConfig);
  const results = run(parsedOptions, config);
  const final = completeFiles(results);

  return await writeFiles(final, parsedOptions);
}
