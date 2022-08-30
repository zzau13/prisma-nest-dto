import type { Help } from '../help';
import type { ConnectDtoParams } from '../types';

interface GenerateConnectDtoParam extends ConnectDtoParams {
  templateHelpers: Help;
}
export const generateConnectDto = ({
  model,
  fields,
  imports,
  templateHelpers: t,
}: GenerateConnectDtoParam) => {
  const name = t.connectDtoName(model.name);
  const template = `
${t.importStatements(imports)}
  export class ${name} {
${t.fieldsToDtoProps(
  fields.map((x) => ({ ...x, isRequired: true })),
  true,
)}
  }
  `;

  return template;
};
