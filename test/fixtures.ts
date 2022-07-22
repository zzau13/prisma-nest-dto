import { expect, test } from 'vitest';
import { readFile } from 'fs/promises';
import path from 'path';
import { globby } from 'globby';
import { getConfig, getDMMF } from '@prisma/sdk';

import { run } from '../src/generator';
import { parseOptions } from '../src/options';

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

export const testFixtures = (baseDir: string) =>
  test(baseDir, async () => {
    const fixtures = await getFixtures(path.join(__dirname, baseDir));
    fixtures.map(parseOptions).forEach((x) => {
      expect(run(x)).toMatchSnapshot();
    });
  });
