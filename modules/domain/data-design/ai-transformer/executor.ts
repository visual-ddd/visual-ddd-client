/**
 * 执行器
 */

import { DataObjectPropertyDSL, DataObjectReferenceCardinality, DataObjectTypeName } from '../dsl/dsl';
import { DirectiveName, GroupedTransformDirectives, TableFieldReference } from './protocol';

export interface ITable {
  getId(): string;
  setTitle(title: string): void;
  rename(newName: string): void;
  remove(): void;
  getFieldByName(name: string): DataObjectPropertyDSL;
  addField(
    name: string,
    params: {
      title: string;
      type: DataObjectTypeName;
      reference?: TableFieldReference;
      referenceCardinality?: DataObjectReferenceCardinality;
      primaryKey?: boolean;
      notNull?: boolean;
    }
  ): void;
  updateField(
    name: string,
    params: {
      title?: string;
      type?: DataObjectTypeName;
      reference?: TableFieldReference;
      referenceCardinality?: DataObjectReferenceCardinality;
      primaryKey?: boolean;
      notNull?: boolean;
    }
  ): void;
  removeField(name: string): void;
  renameField(name: string, newName: string): void;
}

export interface ITableStore {
  getTableByName(name: string): ITable | undefined;
  createTable: (name: string) => ITable;
}

export class Executor {
  private store: ITableStore;
  constructor(inject: { store: ITableStore }) {
    this.store = inject.store;
  }

  execute(directives: GroupedTransformDirectives[]) {
    console.log(`执行数据对象编辑: `, directives);

    for (const group of directives) {
      const tableName = group.table;
      let table = this.getTable(tableName);

      const hightTasks: Array<() => void> = [];
      const tasks: Array<() => void> = [];

      // Table directive execute
      for (const tableDirective of group.tableDirectives) {
        if (tableDirective.type === DirectiveName.CreateTable) {
          hightTasks.unshift(() => {
            table = this.store.createTable(tableName);
            table.setTitle(tableDirective.params.title);
          });
        }

        if (tableDirective.type === DirectiveName.RemoveTable) {
          tasks.unshift(() => {
            table?.remove();
          });
        }

        if (tableDirective.type === DirectiveName.UpdateTable) {
          tasks.unshift(() => {
            const { title } = tableDirective.params;
            table?.setTitle(title);
          });
        }

        if (tableDirective.type === DirectiveName.RenameTable) {
          tasks.push(() => {
            const { newName } = tableDirective.params;
            table?.rename(newName);
          });
        }
      }

      this.runTask(hightTasks);

      if (table == null) {
        continue;
      }

      // Field directive execute
      for (const fieldDirective of group.fieldDirectives) {
        const { name } = fieldDirective.params;
        if (fieldDirective.type === DirectiveName.AddField) {
          hightTasks.unshift(() => {
            table!.addField(name, fieldDirective.params);
          });
        }

        if (fieldDirective.type === DirectiveName.RemoveField) {
          hightTasks.push(() => {
            table!.removeField(name);
          });
        }

        if (fieldDirective.type === DirectiveName.UpdateField) {
          hightTasks.push(() => {
            table!.updateField(name, fieldDirective.params);
          });
        }

        if (fieldDirective.type === DirectiveName.RenameField) {
          tasks.unshift(() => {
            table!.renameField(name, fieldDirective.params.newName);
          });
        }
      }

      this.runTask(hightTasks);
      this.runTask(tasks);
    }
  }

  private runTask(tasks: Array<() => void>) {
    let task: (() => void) | undefined;
    while ((task = tasks.shift())) {
      task();
    }
  }

  private getTable(name: string) {
    const table = this.store.getTableByName(name);
    return table;
  }
}
