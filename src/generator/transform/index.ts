import { Help } from '../help';
import { transformConnect } from './transform-connect';
import { transformCreate } from './transform-create';
import { transformUpdate } from './transform-update';
import { transformEntity } from './transform-entity';

import type { Model, ModelParams } from '../types';

interface ComputeModelParamsParam {
  model: Model;
  allModels: Model[];
  templateHelpers: Help;
}
export const computeModelParams = ({
  model,
  allModels,
  templateHelpers,
}: ComputeModelParamsParam): ModelParams => ({
  connect: transformConnect({ model, help: templateHelpers }),
  create: transformCreate({
    model,
    allModels, // ? should this be `allModels: models` instead
    help: templateHelpers,
  }),

  update: transformUpdate({
    model,
    allModels,
    help: templateHelpers,
  }),
  entity: transformEntity({ model, allModels, help: templateHelpers }),
});
