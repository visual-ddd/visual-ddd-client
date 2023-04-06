import { runInAction } from 'mobx';
import { ITable, ITableStore } from '../../ai-transformer';
import { DataObjectEditorModel, DataObjectStore } from '../../model';
import { Table } from './Table';

/**
 * 表容器
 */
export class TableStore implements ITableStore {
  private editorModel: DataObjectEditorModel;
  private dataObjectStore: DataObjectStore;
  private tables: Map<string, Table> = new Map();

  /**
   * 警告信息
   */
  readonly warning: string[] = [];
  private onMessage?: (message: string) => void;

  constructor(inject: { editorModel: DataObjectEditorModel; onMessage?: (message: string) => void }) {
    this.onMessage = inject.onMessage;
    this.editorModel = inject.editorModel;
    this.dataObjectStore = inject.editorModel.dataObjectStore;
  }

  addLog(message: string) {
    this.onMessage?.(message);
  }

  /**
   * 执行任务
   */
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

    this.addLog(`创建数据对象 ${name}...`);

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
