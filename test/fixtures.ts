import { globby } from 'globby';
import { readFile } from 'fs/promises';
import { getConfig, getDMMF } from '@prisma/sdk';
import path from 'path';
import { parseOptions } from '../src/generate';
import { expect } from 'vitest';
import { run } from '../src/generator';

const getFixtures = async (baseDir: string) => {
  const files = await globby(baseDir);
  return Promise.all(
    files.map(async (file) => {
      const datamodel = (await readFile(file)).toString();
      return {
        dmmf: await getDMMF({ datamodel }),
        generator: (await getConfig({ datamodel })).generators[0],
      };
    }),
  );
};

export const testFixtures = (baseDir: string) => async () => {
  const fixtures = await getFixtures(path.join(__dirname, baseDir));
  fixtures.map(parseOptions).forEach((x) => {
    expect(run(x)).toMatchSnapshot();
  });
};
