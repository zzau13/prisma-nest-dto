import path from 'node:path';
import { camel, pascal, kebab, snake } from 'case';
import { logger } from '@prisma/internals';

import { makeHelpers } from './template-helpers';
import { computeModelParams } from './transform';
import {
  generateConnectDto,
  generateCreateDto,
  generateUpdateDto,
  generateEntity,
} from './generate';
import { DTO_IGNORE_MODEL } from './annotations';
import { isAnnotatedWith } from './field-classifiers';
import { NamingStyle, Model } from './types';

import { parseOptions } from '../options';

const transformers: Record<NamingStyle, (str: string) => string> = {
  camel,
  kebab,
  pascal,
  snake,
};

export const run = ({
  output,
  dmmf,
  exportRelationModifierClasses,
  outputToNestJsResourceStructure,
  fileNamingStyle,
  ...preAndSuffixes
}: ReturnType<typeof parseOptions>) => {
  const transformFileNameCase = transformers[fileNamingStyle];
  const templateHelpers = makeHelpers({
    transformFileNameCase,
    transformClassNameCase: pascal,
    ...preAndSuffixes,
  });
  const allModels = dmmf.datamodel.models;

  const filteredModels: Model[] = allModels
    .filter((model) => !isAnnotatedWith(model, DTO_IGNORE_MODEL))
    .map((model) => ({
      ...model,
      output: {
        dto: outputToNestJsResourceStructure
          ? path.join(output, transformFileNameCase(model.name), 'dto')
          : output,
        entity: outputToNestJsResourceStructure
          ? path.join(output, transformFileNameCase(model.name), 'entities')
          : output,
      },
    }));

  return filteredModels.flatMap((model) => {
    logger.info(`Processing Model ${model.name}`);

    const modelParams = computeModelParams({
      model,
      allModels: filteredModels,
      templateHelpers,
    });

    // generate connect-model.dto.ts
    const connectDto = {
      fileName: path.join(
        model.output.dto,
        templateHelpers.connectDtoFilename(model.name, true),
      ),
      content: generateConnectDto({
        ...modelParams.connect,
        templateHelpers,
      }),
    };

    // generate create-model.dto.ts
    const createDto = {
      fileName: path.join(
        model.output.dto,
        templateHelpers.createDtoFilename(model.name, true),
      ),
      content: generateCreateDto({
        ...modelParams.create,
        exportRelationModifierClasses,
        templateHelpers,
      }),
    };
    // TODO generate create-model.struct.ts

    // generate update-model.dto.ts
    const updateDto = {
      fileName: path.join(
        model.output.dto,
        templateHelpers.updateDtoFilename(model.name, true),
      ),
      content: generateUpdateDto({
        ...modelParams.update,
        exportRelationModifierClasses,
        templateHelpers,
      }),
    };
    // TODO generate update-model.struct.ts

    // generate model.entity.ts
    const entity = {
      fileName: path.join(
        model.output.entity,
        templateHelpers.entityFilename(model.name, true),
      ),
      content: generateEntity({
        ...modelParams.entity,
        templateHelpers,
      }),
    };
    // TODO generate model.struct.ts

    return [connectDto, createDto, updateDto, entity];
  });
};
