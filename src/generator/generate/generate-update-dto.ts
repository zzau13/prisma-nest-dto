import type { Help } from '../help';
import { transformUpdate } from '../transform';

export const generateUpdateDto = ({
  model,
  fields,
  imports,
  extraClasses,
  apiExtraModels,
  exportRelationModifierClasses,
  help,
}: ReturnType<typeof transformUpdate> & {
  exportRelationModifierClasses: boolean;
  help: Help;
}) => `
${help.importStatements(imports)}
${extraClasses.each(
  exportRelationModifierClasses ? (content) => `export ${content}` : help.echo,
  '\n',
)}
${help.if(apiExtraModels.length, help.apiExtraModels(apiExtraModels))}
export class ${help.updateDtoName(model.name)} {
${help.fieldsToEntityProps(fields)}
}
`;
