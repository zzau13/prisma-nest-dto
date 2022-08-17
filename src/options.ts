import { GeneratorOptions } from '@prisma/generator-helper';
import { parseEnvValue } from '@prisma/internals';
import { NamingStyle } from './generator/types';

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
