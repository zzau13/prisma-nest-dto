import type { TemplateHelpers } from '../template-helpers';
import type { CreateDtoParams } from '../types';

interface GenerateCreateDtoParam extends CreateDtoParams {
  exportRelationModifierClasses: boolean;
  templateHelpers: TemplateHelpers;
}
export const generateCreateDto = ({
  model,
  fields,
  imports,
  extraClasses,
  apiExtraModels,
  exportRelationModifierClasses,
  templateHelpers: t,
}: GenerateCreateDtoParam) => `
${t.importStatements(imports)}
${extraClasses.each(
  exportRelationModifierClasses ? (content) => `export ${content}` : t.echo,
  '\n',
)}
${t.if(apiExtraModels.length, t.apiExtraModels(apiExtraModels))}
export class ${t.createDtoName(model.name)} {
${t.fieldsToDtoProps(fields, true)}
}
`;
