import { extname, isAbsolute, join } from 'node:path';
import { stat } from 'node:fs/promises';

export const FILE = 'nest-dto.js';
const CONFIG = {
  regulars: [] as {
    models?: RegExp;
    fields: { regex: RegExp; decorators: string; relations?: boolean }[];
  }[],
};

export type Config = Readonly<typeof CONFIG>;
export const defConfig = (cfg: Partial<Config>): Config => ({
  ...CONFIG,
  ...cfg,
});

enum Stat {
  File,
  NotFile,
  NotDefined,
}

export async function getConfigFile(file = FILE): Promise<Config> {
  if (extname(file) !== '.js')
    throw new Error('config file extension should be ".js"');
  const path = isAbsolute(file) ? file : join(process.cwd(), file);

  const throwBad = () => {
    throw new Error(`bad config path ${JSON.stringify(file)}`);
  };
  switch (
    await stat(path)
      .then((x) => (x.isFile() ? Stat.File : Stat.NotFile))
      .catch(() => {
        if (file !== FILE) throwBad();
        return Stat.NotDefined;
      })
  ) {
    case Stat.File:
      return await import(path);
    case Stat.NotFile:
      return throwBad();
    case Stat.NotDefined:
      return CONFIG;
  }
}
