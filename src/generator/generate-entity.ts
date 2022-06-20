import type { TemplateHelpers } from './template-helpers';
import type { EntityParams } from './types';

interface GenerateEntityParam extends EntityParams {
  templateHelpers: TemplateHelpers;
}
export const generateEntity = ({
  model,
  fields,
  imports,
  apiExtraModels,
  templateHelpers: t,
}: GenerateEntityParam) => {
  const name = t.entityName(model.name);
  return `${t.importStatements(
    imports.concat([
      { from: '@nestjs/swagger', destruct: ['IntersectionType'] },
    ]),
  )}

${t.if(apiExtraModels.length, t.apiExtraModels(apiExtraModels))}
export class ${name} {
  ${t.fieldsToEntityProps(fields.filter((x) => x.isRequired))}
}
export class ${name}Rel {
  ${t.fieldsToEntityProps(
    fields
      .filter((x) => !x.isRequired)
      .map((x) => ({ ...x, isRequired: true })),
  )}
}

export class ${name}Full extends IntersectionType(${name}, ${name}Rel) {}
`;
};
