import { GeneratorOptions } from '@prisma/generator-helper';
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
  const parsedOutput = output?.value ?? '';
  // TODO: check is string
  const {
    connectDtoPrefix = 'Connect',
    createDtoPrefix = 'Create',
    updateDtoPrefix = 'Update',
    dtoSuffix = 'Dto',
    entityPrefix = '',
    entitySuffix = '',
    fileNamingStyle = 'kebab',
    fileConfig = FILE,
  } = config as Record<string, string>;

  const cvIsDateString = stringToBoolean(config.cvIsDateString, true);
  const cvIsOptional = stringToBoolean(config.cvIsOptional, true);
  const decimalAsNumber = stringToBoolean(config.decimalAsNumber, false);
  const prettier = stringToBoolean(config.prettier, true);
  const exportRelationModifierClasses = stringToBoolean(
    config.exportRelationModifierClasses,
    true,
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
    output: parsedOutput,
    prettier,
    updateDtoPrefix,
  };
}
