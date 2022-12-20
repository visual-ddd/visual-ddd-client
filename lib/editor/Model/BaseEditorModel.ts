import { Map as YMap, Doc as YDoc } from 'yjs';
import { BaseEditorStore } from './BaseEditorStore';
import { BaseEditorCommandHandler } from './BaseEditorCommandHandler';
import { BaseEditorDatasource } from './BaseEditorDatasource';
import { BaseEditorEvent } from './BaseEditorEvent';
import { BaseEditorIndex } from './BaseEditorIndex';
import { BaseEditorViewStore } from './BaseEditorViewStore';
import { BaseEditorFormStore } from './BaseEditorFormStore';

export interface BaseEditorModelOptions {
  datasource: YMap<any>;
  doc: YDoc;
}

/**
 * 编辑器模型入口
 */
export class BaseEditorModel {
  /**
   * 命令处理器
   */
  readonly commandHandler: BaseEditorCommandHandler;

  /**
   * 模型状态存储
   */
  readonly store: BaseEditorStore;

  /**
   * 视图模型状态存储
   */
  readonly viewStore: BaseEditorViewStore;

  /**
   * 表单模型
   */
  readonly formStore: BaseEditorFormStore;

  /**
   * 模型层事件
   */
  readonly event: BaseEditorEvent;

  /**
   * 索引
   */
  readonly index: BaseEditorIndex;

  /**
   * 模型状态数据源
   */
  protected datasource: BaseEditorDatasource;

  constructor(options: BaseEditorModelOptions) {
    const { datasource, doc } = options;

    this.event = new BaseEditorEvent();
    this.index = new BaseEditorIndex({ event: this.event });
    this.store = new BaseEditorStore({ event: this.event });
    this.datasource = new BaseEditorDatasource({
      event: this.event,
      store: this.store,
      index: this.index,
      datasource,
      doc,
    });
    this.viewStore = new BaseEditorViewStore({ datasource: this.datasource });
    this.formStore = new BaseEditorFormStore({ event: this.event, store: this.store });
    this.commandHandler = new BaseEditorCommandHandler({
      event: this.event,
      store: this.store,
      viewStore: this.viewStore,
      datasource: this.datasource,
    });
  }
}
