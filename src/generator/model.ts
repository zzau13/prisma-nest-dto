import path from 'node:path';
import { DMMF } from '@prisma/generator-helper';

import { Ann, annotate } from './annotations';
import { Config } from '../config';
import { decoIsDateString, decoNotRequired, decoRelated } from '../contants';
import { isAnnotatedWith } from './field-classifiers';
import { PrismaType, transformers } from './help';
import { Options } from '../options';
import { doRegulars } from './regulars';

export type Model = ReturnType<typeof getModels>[number];
export const getModels = (
  models: readonly DMMF.Model[],
  { output, fileNamingStyle, cvIsOptional, cvIsDateString }: Options,
  config: Config,
) =>
  models
    .map((model) => ({ ...model, annotations: annotate(model.documentation) }))
    .filter((x) => !isAnnotatedWith(x, Ann.IGNORE))
    .map((model) => {
      const regulars = config.regulars
        .filter((x) => x.models === undefined || x.models.test(model.name))
        .flatMap((x) => x.fields);
      return {
        ...model,
        fields: model.fields
          .map((x) => ({
            ...x,
            // TODO: wrap
            annotations: annotate(doRegulars(x, regulars))
              .concat(x.kind === 'object' ? decoRelated(x.type) : [])
              .concat(cvIsOptional && !x.isRequired ? decoNotRequired : [])
              .concat(
                cvIsDateString && (x.type as PrismaType) === 'DateTime'
                  ? decoIsDateString
                  : [],
              ),
          }))
          .filter((x) => !isAnnotatedWith(x, Ann.IGNORE)),
        output: {
          dto: path.join(
            output,
            transformers[fileNamingStyle](model.name),
            'dto',
          ),
          entity: path.join(
            output,
            transformers[fileNamingStyle](model.name),
            'entities',
          ),
        },
      };
    });
