import { GeneratorOptions } from '@prisma/generator-helper';
import { Dictionary, parseEnvValue } from '@prisma/internals';
import { FILE } from './config';

function stringToBoolean(input?: string | string[], defaultValue = false) {
  if (input === 'true') {
    return true;
  }
  if (input === 'false') {
    return false;
  }

  return defaultValue;
}

export type Options = ReturnType<typeof parseOptions>;

export function parseOptions({
  generator: { config, output },
  dmmf,
}: Pick<GeneratorOptions, 'dmmf' | 'generator'>) {
  const parsedOutput = output ? parseEnvValue(output) : '';
  // TODO: check is string
  const {
    connectDtoPrefix = 'Connect',
    createDtoPrefix = 'Create',
    updateDtoPrefix = 'Update',
    dtoSuffix = 'Dto',
    entityPrefix = '',
    entitySuffix = '',
    fileNamingStyle = 'kebab',
    mode = 'openapi',
    fileConfig = FILE,
    importPath = '@prisma/client',
  } = config as Dictionary<string>;

  const cvIsDateString = stringToBoolean(config.cvIsDateString, true);
  const cvIsOptional = stringToBoolean(config.cvIsOptional, true);
  const decimalAsNumber = stringToBoolean(config.decimalAsNumber, false);
  const prettier = stringToBoolean(config.prettier, true);
  const exportRelationModifierClasses = stringToBoolean(
    config.exportRelationModifierClasses,
    true,
  );

  const outputToNestJsResourceStructure = stringToBoolean(
    config.outputToNestJsResourceStructure,
    false,
  );

  type NamingStyle = 'snake' | 'camel' | 'pascal' | 'kebab';
  const supportedFileNamingStyles: NamingStyle[] = [
    'kebab',
    'camel',
    'pascal',
    'snake',
  ];
  const isSupportedFileNamingStyle = (
    style: string | string[],
  ): style is NamingStyle =>
    supportedFileNamingStyles.includes(style as NamingStyle);

  if (!isSupportedFileNamingStyle(fileNamingStyle)) {
    throw new Error(
      `'${fileNamingStyle}' is not a valid file naming style. Valid options are ${supportedFileNamingStyles.each(
        (s) => `'${s}'`,
        ', ',
      )}.`,
    );
  }

  type Mode = 'openapi' | 'graphql';
  const modes: Mode[] = ['openapi', 'graphql'];
  const isMode = (mode: unknown): mode is Mode => modes.includes(mode as Mode);
  if (!isMode(mode))
    throw new Error(
      `${mode} is not a valid mode. Valid options ar ${modes.each(
        (s) => `'${s}'`,
        ', ',
      )}`,
    );

  return {
    connectDtoPrefix,
    createDtoPrefix,
    cvIsDateString,
    cvIsOptional,
    decimalAsNumber,
    dmmf,
    dtoSuffix,
    entityPrefix,
    entitySuffix,
    exportRelationModifierClasses,
    fileConfig,
    fileNamingStyle,
    importPath,
    mode,
    output: parsedOutput,
    outputToNestJsResourceStructure,
    prettier,
    updateDtoPrefix,
  };
}
