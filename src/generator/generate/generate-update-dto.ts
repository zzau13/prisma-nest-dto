import type { Help } from '../help';
import type { UpdateDtoParams } from '../types';

interface GenerateUpdateDtoParam extends UpdateDtoParams {
  exportRelationModifierClasses: boolean;
  templateHelpers: Help;
}
export const generateUpdateDto = ({
  model,
  fields,
  imports,
  extraClasses,
  apiExtraModels,
  exportRelationModifierClasses,
  templateHelpers: t,
}: GenerateUpdateDtoParam) => {
  return `
${t.importStatements(imports)}
${extraClasses.each(
  exportRelationModifierClasses ? (content) => `export ${content}` : t.echo,
  '\n',
)}
${t.if(apiExtraModels.length, t.apiExtraModels(apiExtraModels))}
export class ${t.updateDtoName(model.name)} {
${t.fieldsToEntityProps(fields)}
}
`;
};
