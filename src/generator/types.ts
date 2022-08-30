import { DMMF } from '@prisma/generator-helper';

export interface Model extends DMMF.Model {
  output: {
    dto: string;
    entity: string;
  };
}

export type Decorator = {
  import: string;
  code: string;
};

export type ParsedField = {
  kind: DMMF.FieldKind | 'relation-input';
  decorators: Decorator[];
  name: string;
  type: string;
  documentation?: string;
  isRequired: boolean;
  isList: boolean;
  /**
   * used when rendering Entity templates - fields that are optional in Prisma Schema
   * are returned as `null` values (if not filled) when fetched from PrismaClient.
   * **must not be `true` when `isRequired` is `true`**
   */
  isNullable?: boolean;
};

export interface Imports {
  from: string;
  /**
   * imports default export from `from`.
   * use `string` to just get the default export and `{'*': localName`} for all exports (e.g. `import * as localName from 'baz'`)
   */
  default?: string | { '*': string };
  /**
   * imports named exports from `from`.
   * use `string` to keep exported name and `{exportedName: localName}` for renaming (e.g. `import { foo as bar } from 'baz'`)
   *
   * @example `foo`
   * @example `{exportedName: localName}`
   */
  destruct?: (string | Record<string, string>)[];
}
