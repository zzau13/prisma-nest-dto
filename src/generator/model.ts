import path from 'node:path';
import { DMMF } from '@prisma/generator-helper';

import { Ann } from './annotations';
import { Config } from '../config';
import { decoRelated } from '../contants';
import { isAnnotatedWith } from './field-classifiers';
import { annotate, transformers } from './help';
import { Options } from '../options';
import { regulars } from './regulars';

export type Model = ReturnType<typeof getModels>[number];
export const getModels = (
  models: DMMF.Model[],
  { outputToNestJsResourceStructure, output, fileNamingStyle }: Options,
  config: Config,
) =>
  models
    .map((model) => ({ ...model, annotations: annotate(model.documentation) }))
    .filter((x) => !isAnnotatedWith(x, Ann.IGNORE))
    .map((model) => {
      const fields = config.regulars
        .filter((x) => x.models === undefined || x.models.test(model.name))
        .flatMap((x) => x.fields);
      return {
        ...model,
        fields: model.fields
          .map((x) => ({
            ...x,
            annotations: annotate(regulars(x, fields)).concat(
              x.kind === 'object' ? decoRelated : [],
            ),
          }))
          .filter((x) => !isAnnotatedWith(x, Ann.IGNORE)),
        output: {
          dto: outputToNestJsResourceStructure
            ? path.join(
                output,
                transformers[fileNamingStyle](model.name),
                'dto',
              )
            : output,
          entity: outputToNestJsResourceStructure
            ? path.join(
                output,
                transformers[fileNamingStyle](model.name),
                'entities',
              )
            : output,
        },
      };
    });
