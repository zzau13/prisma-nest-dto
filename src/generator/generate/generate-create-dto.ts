import type { Help } from '../help';
import { transformCreate } from '../transform';

export const generateCreateDto = ({
  model,
  fields,
  imports,
  extraClasses,
  apiExtraModels,
  exportRelationModifierClasses,
  help,
}: ReturnType<typeof transformCreate> & {
  exportRelationModifierClasses: boolean;
  help: Help;
}) => `
${help.importStatements(imports)}
${extraClasses.each(
  exportRelationModifierClasses ? (content) => `export ${content}` : help.echo,
  '\n',
)}
${help.if(apiExtraModels.length, help.apiExtraModels(apiExtraModels))}
export class ${help.createDtoName(model.name)} {
${help.fieldsToDtoProps(fields, true)}
}
`;
