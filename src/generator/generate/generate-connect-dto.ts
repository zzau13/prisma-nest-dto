import type { Help } from '../help';
import { transformConnect } from '../transform';

export const generateConnectDto = ({
  model,
  fields,
  imports,
  help,
}: ReturnType<typeof transformConnect> & { help: Help }) =>
  `
${help.importStatements(imports)}
export class ${help.connectDtoName(model.name)} {
${help.fieldsToDtoProps(
  fields.map((x) => ({ ...x, isRequired: true })),
  true,
)}
}
`;
