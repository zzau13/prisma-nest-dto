import type { Help } from '../help';
import { transformEntity } from '../transform';

export const generateEntity = ({
  model,
  fields,
  imports,
  apiExtraModels,
  help,
}: ReturnType<typeof transformEntity> & { help: Help }) => {
  const name = help.entityName(model.name);
  return `
${help.importStatements(imports)}
${help.if(apiExtraModels.length, help.apiExtraModels(apiExtraModels))}
export class ${name} {
${help.fieldsToEntityProps(fields.filter((x) => x.isRequired))}
}
export class ${name}Rel {
${help.fieldsToEntityProps(
  fields.filter((x) => !x.isRequired).map((x) => ({ ...x, isRequired: true })),
)}
}
export class ${name}Full extends IntersectionType(${name}, ${name}Rel) {}
`;
};
