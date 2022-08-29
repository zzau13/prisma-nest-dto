import { GeneratorOptions } from '@prisma/generator-helper';
import { parseEnvValue } from '@prisma/internals';

const stringToBoolean = (input: string, defaultValue = false) => {
  if (input === 'true') {
    return true;
  }
  if (input === 'false') {
    return false;
  }

  return defaultValue;
};

export type Options = ReturnType<typeof parseOptions>;

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
    mode = 'openapi',
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

  type NamingStyle = 'snake' | 'camel' | 'pascal' | 'kebab';
  const supportedFileNamingStyles: NamingStyle[] = [
    'kebab',
    'camel',
    'pascal',
    'snake',
  ];
  const isSupportedFileNamingStyle = (style: string): style is NamingStyle =>
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
  const isMode = (mode: string): mode is Mode => modes.includes(mode as Mode);
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
    decimalAsNumber,
    dmmf,
    dtoSuffix,
    entityPrefix,
    entitySuffix,
    exportRelationModifierClasses,
    fileNamingStyle,
    mode,
    output: parsedOutput,
    outputToNestJsResourceStructure,
    updateDtoPrefix,
  };
};
