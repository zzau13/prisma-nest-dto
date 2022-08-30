import { Help } from '../help';
import { transformConnect } from './transform-connect';
import { transformCreate } from './transform-create';
import { transformUpdate } from './transform-update';
import { transformEntity } from './transform-entity';

import type { Model } from '../types';

export const computeModelParams = ({
  model,
  allModels,
  help,
}: {
  model: Model;
  allModels: Model[];
  help: Help;
}) => ({
  connect: transformConnect({ model, help }),
  create: transformCreate({
    model,
    allModels, // ? should this be `allModels: models` instead
    help,
  }),

  update: transformUpdate({
    model,
    allModels,
    help,
  }),
  entity: transformEntity({ model, allModels, help }),
});
