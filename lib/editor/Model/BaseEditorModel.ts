import { Map as YMap, Doc as YDoc } from 'yjs';
import { BaseEditorStore } from './BaseEditorStore';
import { BaseEditorCommandHandler } from './BaseEditorCommandHandler';
import { BaseEditorDatasource } from './BaseEditorDatasource';
import { BaseEditorEvent } from './BaseEditorEvent';
import { BaseEditorIndex } from './BaseEditorIndex';
import { BaseEditorViewStore } from './BaseEditorViewStore';
import { BaseEditorFormStore } from './BaseEditorFormStore';
import { BaseEditorScope } from './BaseEditorScope';

export interface BaseEditorModelOptions {
  /**
   * 作用域 id, 因为全局可能并存多个编辑器，我们通过 scopeId 来划分命名空间
   */
  scopeId: string;

  /**
   * 是否立即激活作用域, 默认 true, 当同一个页面并存多个编辑器时(如 Tab 页面), 建议关闭，并手动激活
   */
  activeScope?: boolean;

  /**
   * yjs 数据源
   */
  datasource: YMap<any>;

  /**
   * yjs 文档
   */
  doc: YDoc;
}

declare global {
  interface IBaseEditorScopeMembers {
    editorModel: BaseEditorModel;
  }
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
   * 可全局共享的作用域
   */
  readonly scope: BaseEditorScope;

  /**
   * 模型状态数据源
   */
  protected datasource: BaseEditorDatasource;

  /**
   * 当前编辑器是否激活
   */
  get isActive() {
    return this.scope.isActive();
  }

  constructor(options: BaseEditorModelOptions) {
    const { datasource, doc, scopeId, activeScope = true } = options;

    this.scope = new BaseEditorScope({ scopeId });
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
    this.formStore = new BaseEditorFormStore({ event: this.event, store: this.store, editorModel: this });
    this.commandHandler = new BaseEditorCommandHandler({
      event: this.event,
      store: this.store,
      viewStore: this.viewStore,
      datasource: this.datasource,
    });

    this.scope.registerScopeMember('editorModel', this);

    if (activeScope) {
      this.active();
    }
  }

  active() {
    this.scope.activeScope();
  }
}
