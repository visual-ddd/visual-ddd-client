import { Map as YMap, Doc as YDoc } from 'yjs';
import { BaseEditorStore } from './BaseEditorStore';
import { BaseEditorCommandHandler } from './BaseEditorCommandHandler';
import { BaseEditorDatasource } from './BaseEditorDatasource';
import { BaseEditorEvent } from './BaseEditorEvent';
import { BaseEditorIndex } from './BaseEditorIndex';

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
   * 模型状态数据源
   */
  readonly datasource: BaseEditorDatasource;

  /**
   * 模型层事件
   */
  readonly event: BaseEditorEvent;

  /**
   * 索引
   */
  readonly index: BaseEditorIndex;

  constructor(options: BaseEditorModelOptions) {
    const { datasource, doc } = options;

    this.event = new BaseEditorEvent();
    this.index = new BaseEditorIndex({ event: this.event });
    this.store = new BaseEditorStore({ event: this.event });
    this.datasource = new BaseEditorDatasource({ event: this.event, store: this.store, datasource, doc });
    this.commandHandler = new BaseEditorCommandHandler({ event: this.event, store: this.store });
  }
}
