import path from 'node:path';
import { logger } from '@prisma/internals';

import { getModels, makeHelpers } from './help';
import {
  transformEntity,
  transformCreate,
  transformUpdate,
  transformConnect,
} from './transform';
import {
  generateConnectDto,
  generateCreateDto,
  generateUpdateDto,
  generateEntity,
} from './generate';

import { Options } from '../options';

export const run = (options: Options) => {
  const { dmmf, exportRelationModifierClasses } = options;
  const help = makeHelpers(options);
  const allModels = getModels(dmmf.datamodel.models, options);

  return allModels.flatMap((model) => {
    logger.info(`Processing Model ${model.name}`);

    // generate connect-model.dto.ts
    const connectDto = {
      fileName: path.join(
        model.output.dto,
        help.connectDtoFilename(model.name, true),
      ),
      content: generateConnectDto({
        ...transformConnect({ model, help }),
        help,
      }),
    };

    // generate create-model.dto.ts
    const createDto = {
      fileName: path.join(
        model.output.dto,
        help.createDtoFilename(model.name, true),
      ),
      content: generateCreateDto({
        ...transformCreate({ model, allModels, help }),
        exportRelationModifierClasses,
        help: help,
      }),
    };
    // TODO generate create-model.struct.ts

    // generate update-model.dto.ts
    const updateDto = {
      fileName: path.join(
        model.output.dto,
        help.updateDtoFilename(model.name, true),
      ),
      content: generateUpdateDto({
        ...transformUpdate({ model, allModels, help }),
        exportRelationModifierClasses,
        help: help,
      }),
    };
    // TODO generate update-model.struct.ts

    // generate model.entity.ts
    const entity = {
      fileName: path.join(
        model.output.entity,
        help.entityFilename(model.name, true),
      ),
      content: generateEntity({
        ...transformEntity({ model, allModels, help }),
        help,
      }),
    };
    // TODO generate model.struct.ts

    return [connectDto, createDto, updateDto, entity];
  });
};
