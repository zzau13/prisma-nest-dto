import { DMMF } from '@prisma/generator-helper';
import { annotate } from './annotations';

export type Annotation = { annotations: ReturnType<typeof annotate> };
export type ParsedField = {
  kind: DMMF.FieldKind | 'relation-input';
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
} & Annotation;

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

export type FieldOverride = Partial<
  { -readonly [P in keyof DMMF.Field]: DMMF.Field[P] } & { isNullable: boolean }
>;
