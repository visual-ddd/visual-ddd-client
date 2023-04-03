import { DataObjectTypeName, DataObjectReferenceCardinality } from '../dsl/dsl';

/**
 * 指令名称
 */
export enum DirectiveName {
  CreateTable = 'createTable',
  UpdateTable = 'updateTable',
  RenameTable = 'renameTable',
  RemoveTable = 'removeTable',
  AddField = 'addField',
  RemoveField = 'removeField',
  UpdateField = 'updateField',
  RenameField = 'renameField',
}

export const AVAILABLE_DIRECTIVES = Object.values(DirectiveName);

export interface CreateTableDirective {
  type: DirectiveName.CreateTable;
  params: {
    name: string;
    title: string;
  };
}

export interface UpdateTableDirective {
  type: DirectiveName.UpdateTable;
  params: {
    name: string;
    title: string;
  };
}

export interface RenameTableDirective {
  type: DirectiveName.RenameTable;
  params: {
    name: string;
    newName: string;
  };
}

export interface RemoveTableDirective {
  type: DirectiveName.RemoveTable;
  params: {
    name: string;
  };
}

export type TableFieldReference = `${string}.${string}`;

export interface AddFieldDirective {
  type: DirectiveName.AddField;
  params: {
    table: string;
    name: string;
    title: string;
    type: DataObjectTypeName;
    reference?: TableFieldReference;
    referenceCardinality?: DataObjectReferenceCardinality;
    primaryKey?: boolean;
    notNull?: boolean;
  };
}

export interface RemoveFieldDirective {
  type: DirectiveName.RemoveField;
  params: {
    table: string;
    name: string;
  };
}

export interface UpdateFieldDirective {
  type: DirectiveName.UpdateField;
  params: {
    table: string;
    name: string;
    title?: string;
    type?: DataObjectTypeName;
    reference?: TableFieldReference;
    referenceCardinality?: DataObjectReferenceCardinality;
    primaryKey?: boolean;
    notNull?: boolean;
  };
}

export interface RenameFieldDirective {
  type: DirectiveName.RenameField;
  params: {
    table: string;
    name: string;
    newName: string;
  };
}

export type TransformDirective =
  | CreateTableDirective
  | UpdateTableDirective
  | RenameTableDirective
  | RemoveTableDirective
  | AddFieldDirective
  | RemoveFieldDirective
  | UpdateFieldDirective
  | RenameFieldDirective;

export type TableDirective = CreateTableDirective | UpdateTableDirective | RenameTableDirective | RemoveTableDirective;

export type FieldDirective = AddFieldDirective | RemoveFieldDirective | UpdateFieldDirective | RenameFieldDirective;

/**
 * 指令分组
 */
export interface GroupedTransformDirectives {
  /**
   * 归属的表格
   */
  table: string;

  /**
   * 表格级别的指令
   */
  tableDirectives: TransformDirective[];

  /**
   * 字段级别的指令
   */
  fieldDirectives: TransformDirective[];
}

export function isAvailableDirective(name: string): name is DirectiveName {
  return AVAILABLE_DIRECTIVES.includes(name as DirectiveName);
}

export function isTableDirective(directive: TransformDirective): directive is TableDirective {
  return (
    directive.type === DirectiveName.CreateTable ||
    directive.type === DirectiveName.UpdateTable ||
    directive.type === DirectiveName.RenameTable ||
    directive.type === DirectiveName.RemoveTable
  );
}

export function isFieldDirective(directive: TransformDirective): directive is FieldDirective {
  return (
    directive.type === DirectiveName.AddField ||
    directive.type === DirectiveName.RemoveField ||
    directive.type === DirectiveName.UpdateField ||
    directive.type === DirectiveName.RenameField
  );
}

export function getTableName(directive: TransformDirective): string {
  if (isTableDirective(directive)) {
    return directive.params.name;
  } else {
    return directive.params.table;
  }
}
