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

type Task = () => void;

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

      // 高优先级任务, 比如创建表、创建对象；需要先创建表之后才能继续执行字段操作
      const hightTasks: Task[] = [];
      // 普通任务
      const tasks: Task[] = [];

      // Table directive execute
      for (const tableDirective of group.tableDirectives) {
        if (tableDirective.type === DirectiveName.CreateTable) {
          // 创建表优先级最高
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
          // rename 放到最后, 避免因为重命名导致通过 name 找不到对应对象
          tasks.push(() => {
            const { newName } = tableDirective.params;
            table?.rename(newName);
          });
        }
      }

      this.runTask(hightTasks);

      // 表不存在，没有必要继续操作字段了
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
