import { expect, test } from 'vitest';
import { readFile } from 'fs/promises';
import path from 'path';
import { globby } from 'globby';
import { getConfig, getDMMF } from '@prisma/internals';

import { run } from '../src/generator';
import { parseOptions } from '../src/options';
import { defConfig } from '../src';

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

// TODO: coverage config
export const testFixtures = (
  pattern: string,
  cfg?: ReturnType<typeof defConfig>,
) =>
  test(pattern, async () => {
    const fixtures = await getFixtures(path.join(__dirname, pattern));
    fixtures.map(parseOptions).forEach((x) => {
      expect(run(x, defConfig(cfg ?? {}))).toMatchSnapshot();
    });
  });

export const failFixtures = (
  pattern: string,
  cfg?: ReturnType<typeof defConfig>,
) =>
  test(pattern, async () => {
    const fixtures = await getFixtures(path.join(__dirname, pattern));
    fixtures.forEach((opt) => {
      expect(
        (async () => {
          const x = parseOptions(opt);
          run(x, defConfig(cfg ?? {}));
        })(),
      ).rejects.toBeDefined();
    });
  });
