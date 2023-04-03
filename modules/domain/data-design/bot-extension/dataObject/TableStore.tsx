import { runInAction } from 'mobx';
import { ITable, ITableStore } from '../../ai-transformer';
import { DataObjectEditorModel, DataObjectStore } from '../../model';
import { Table } from './Table';

export class TableStore implements ITableStore {
  private editorModel: DataObjectEditorModel;
  private dataObjectStore: DataObjectStore;
  private tables: Map<string, Table> = new Map();

  /**
   * 警告信息
   */
  readonly warning: string[] = [];

  constructor(inject: { editorModel: DataObjectEditorModel }) {
    this.editorModel = inject.editorModel;
    this.dataObjectStore = inject.editorModel.dataObjectStore;
  }

  exec() {
    runInAction(() => {
      this.tables.forEach(table => table.execTasks());
      this.tables.forEach(table => table.execTasksAfterBatch());
      this.tables.forEach(table => table.execTasksOnTheEnd());
    });
  }

  createTable(name: string) {
    const existing = this.getTableByName(name);
    if (existing) {
      this.warning.push(`数据对象 ${name} 已存在, 不能重复创建`);
      return existing;
    }

    const table = new Table({
      name,
      editorModel: this.editorModel,
      dataObjectStore: this.dataObjectStore,
      tableStore: this,
    });

    this.tables.set(name, table);

    return table;
  }

  getTableByName(name: string): ITable | undefined {
    if (this.tables.has(name)) {
      return this.tables.get(name)!;
    }

    const obj = this.dataObjectStore.getObjectByName(name);

    if (!obj) {
      return;
    }

    const table = new Table({
      name,
      dataObject: obj,
      editorModel: this.editorModel,
      dataObjectStore: this.dataObjectStore,
      tableStore: this,
    });
    this.tables.set(name, table);

    return table;
  }
}
