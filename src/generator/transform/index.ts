import { TemplateHelpers } from '../template-helpers';
import { transformConnect } from './transform-connect';
import { transformCreate } from './transform-create';
import { transformUpdate } from './transform-update';
import { transformEntity } from './transform-entity';

import type { Model, ModelParams } from '../types';

interface ComputeModelParamsParam {
  model: Model;
  allModels: Model[];
  templateHelpers: TemplateHelpers;
}
export const computeModelParams = ({
  model,
  allModels,
  templateHelpers,
}: ComputeModelParamsParam): ModelParams => ({
  connect: transformConnect({ model, templateHelpers }),
  create: transformCreate({
    model,
    allModels, // ? should this be `allModels: models` instead
    templateHelpers,
  }),

  update: transformUpdate({
    model,
    allModels,
    templateHelpers,
  }),
  entity: transformEntity({ model, allModels, templateHelpers }),
});
