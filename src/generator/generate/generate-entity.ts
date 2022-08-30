import type { Help } from '../help';
import { transformEntity } from '../transform/transform-entity';
import { zipImportStatementParams } from '../helpers';

export const generateEntity = ({
  model,
  fields,
  imports,
  apiExtraModels,
  help,
}: ReturnType<typeof transformEntity> & { help: Help }) => {
  const name = help.entityName(model.name);
  return `
${help.importStatements(
  zipImportStatementParams(
    imports.concat([
      {
        from: help.nestImport(),
        destruct: ['IntersectionType'].concat(
          fields.find((x) => x.kind === 'enum') ? ['ApiProperty'] : [],
        ),
      },
    ]),
  ),
)}
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
