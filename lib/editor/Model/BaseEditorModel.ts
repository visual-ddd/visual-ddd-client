import { Map as YMap, Doc as YDoc } from 'yjs';
import { IDisposable, tryDispose } from '@/lib/utils';
import { Noop, NoopArray } from '@wakeapp/utils';
import { IValidateStatus } from '@/lib/core';

import { BaseEditorStore } from './BaseEditorStore';
import { BaseEditorCommandHandler } from './BaseEditorCommandHandler';
import { BaseEditorDatasource } from './BaseEditorDatasource';
import { BaseEditorEvent } from './BaseEditorEvent';
import { BaseEditorIndex } from './BaseEditorIndex';
import { BaseEditorAwarenessRegistry, BaseEditorViewStore } from './BaseEditorViewStore';
import { BaseEditorFormStore } from './BaseEditorFormStore';
import { BaseEditorScope } from './BaseEditorScope';
import { BaseEditorPropertyLocationObserver } from './BaseEditorPropertyLocationObserver';

export interface BaseEditorModelOptions {
  /**
   * 是否为只读模式, 默认 false
   */
  readonly?: boolean;

  /**
   * 作用域 id, 因为全局可能并存多个编辑器，我们通过 scopeId 来划分命名空间
   */
  scopeId: string;

  /**
   * 是否立即激活作用域, 默认 true, 当同一个页面并存多个编辑器时(如 Tab 页面), 建议关闭，并手动激活
   */
  activeScope?: boolean;

  /**
   * 支持的图形白名单, 主要用于拷贝粘贴时过滤
   */
  whitelist: string[];

  /**
   * 支持的图形列表
   */
  shapeList: string[];

  /**
   * yjs 数据源
   */
  datasource: YMap<any>;

  /**
   * 远程协作状态
   */
  awarenessRegistry: BaseEditorAwarenessRegistry;

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

const DEFAULT_AWARENESS_REGISTRY: BaseEditorAwarenessRegistry = {
  setState: Noop,
  remoteStates: NoopArray,
  getState() {
    return undefined;
  },
};

/**
 * 编辑器模型入口
 * TODO: 销毁
 */
export class BaseEditorModel implements IDisposable, IValidateStatus {
  readonly readonly: boolean;
  readonly whitelist: string[];
  readonly shapeList: string[];

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
   * 屬性定位監聽器
   */
  readonly propertyLocationObserver: BaseEditorPropertyLocationObserver;

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

  get scopeId() {
    return this.scope.scopeId;
  }

  /**
   * 是否包含告警信息
   */
  get hasIssue() {
    return this.formStore.hasIssue;
  }

  get hasException() {
    return this.formStore.hasException;
  }

  get hasError() {
    return this.formStore.hasError;
  }

  get hasWarning() {
    return this.formStore.hasWarning;
  }

  get hasTip() {
    return this.formStore.hasTip;
  }

  constructor(options: BaseEditorModelOptions) {
    const {
      datasource,
      doc,
      scopeId,
      activeScope = true,
      awarenessRegistry = DEFAULT_AWARENESS_REGISTRY,
      whitelist,
      shapeList,
      readonly = false,
    } = options;

    this.readonly = readonly;
    this.shapeList = shapeList;
    this.whitelist = whitelist;
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
    this.viewStore = new BaseEditorViewStore({
      datasource: this.datasource,
      event: this.event,
      index: this.index,
      awarenessRegistry,
      scope: this.scope,
    });
    this.formStore = new BaseEditorFormStore({ event: this.event, store: this.store, editorModel: this });
    this.commandHandler = new BaseEditorCommandHandler({
      event: this.event,
      store: this.store,
      viewStore: this.viewStore,
      datasource: this.datasource,
      index: this.index,
    });
    this.propertyLocationObserver = new BaseEditorPropertyLocationObserver();

    this.scope.registerScopeMember('editorModel', this);

    if (activeScope) {
      this.active();
    }
  }

  /**
   * 激活作用域
   */
  active() {
    this.scope.activeScope();

    // HACK:
    // 一些放在在 Tab 中的编辑器，通常都是 display: none 隐藏的，
    // 这意味着，一旦标签激活，可能会有一些因为 DOM 事件而触发的事件合并进来，这些可以统一合入到上一个 undo 栈中
    this.mergeUndoCapturing();
  }

  /**
   * 数据验证
   * 如果验证失败则返回 true
   * @returns
   */
  async validate() {
    const invalid = await this.formStore.validate();

    if (!invalid) {
      // 进行一次同步和校准
      await this.datasource.forceSync();
    }

    return invalid;
  }

  mergeUndoCapturing() {
    this.datasource.mergeCapturing();
  }

  stopUndoCapturing() {
    this.datasource.stopCapturing();
  }

  clearUndoStack() {
    this.datasource.clearUndoStack();
  }

  dispose() {
    tryDispose(this.scope);
    tryDispose(this.event);
    tryDispose(this.index);
    tryDispose(this.store);
    tryDispose(this.datasource);
    tryDispose(this.viewStore);
    tryDispose(this.formStore);
    tryDispose(this.commandHandler);
  }
}
