import { makeObservable, observable, reaction, runInAction, toJS } from 'mobx';
import { makeAutoBindThis, derive, mutation } from '@/lib/store';
import { IAwarenessRegistry, IUser } from '@/lib/core';
import { IDisposable } from '@/lib/utils';
import localforage from 'localforage';
import { debounce, Disposer } from '@wakeapp/utils';

import { BaseEditorDatasource } from './BaseEditorDatasource';
import { BaseNode } from './BaseNode';
import { BaseEditorEvent } from './BaseEditorEvent';
import { BaseEditorIndex } from './BaseEditorIndex';
import { BaseEditorScope } from './BaseEditorScope';

/**
 * 图形查看 tab
 */
export enum EditorInspectTab {
  Attributes = 'attributes',
  Problems = 'problems',
}

export interface BaseEditorViewState {
  /**
   * 图形详情 Tab
   */
  inspectTab: EditorInspectTab;

  /**
   * 属性查看栏大小
   */
  inspectPanelWidth?: number;

  /**
   * 侧边栏大小
   */
  sidebarPanelWidth?: number;

  /**
   * 组件库是否折叠
   */
  shapeLibraryFolded: boolean;

  /**
   * 鼠标拖拽的模式
   * select 框选
   * panning 拖拽画布, 默认
   */
  mouseDragMode: 'select' | 'panning';

  /**
   * 画布缩放状态
   */
  canvasScale?: {
    sx: number;
    sy: number;
    ox: number;
    oy: number;
  };
}

/**
 * 多人协作交互状态
 */
export interface BaseEditorAwarenessState {
  focusingNodeId?: string;
  /**
   * 聚焦的时间，用于判断占用的逻辑
   */
  focusingStartAt?: number;
}

/**
 * 远程协作状态
 */
export interface BaseEditorAwarenessRemoteState {
  user: IUser;
  state: BaseEditorAwarenessState;
}

/**
 * 协作交互状态设置
 */
export interface BaseEditorAwarenessRegistry extends IAwarenessRegistry<BaseEditorAwarenessState> {}

/**
 * 这里放置非核心的视图状态
 */
export class BaseEditorViewStore implements IDisposable {
  private datasource: BaseEditorDatasource;
  private event: BaseEditorEvent;
  private awarenessRegistry: BaseEditorAwarenessRegistry;
  private index: BaseEditorIndex;
  private scope: BaseEditorScope;
  private get cacheKey() {
    return `VIEW_STORE:${this.scope.scopeId}:viewState`;
  }

  /**
   * 编辑器视图状态
   */
  @observable
  viewState: BaseEditorViewState = {
    inspectTab: EditorInspectTab.Attributes,
    shapeLibraryFolded: false,
    mouseDragMode: 'panning',
  };

  /**
   * 已选中的节点
   */
  @observable
  selectedNodes: BaseNode[] = [];

  @derive
  get zoomFactor() {
    return Math.round((this.viewState.canvasScale?.sx ?? 1) * 100);
  }

  /**
   * 当前聚焦的节点(单一节点)
   */
  @derive
  get focusingNode() {
    return this.selectedNodes.length === 1 ? this.selectedNodes[0] : null;
  }

  /**
   * 是否支持撤销
   */
  @derive
  get canUndo() {
    return this.datasource.canUndo;
  }

  /**
   * 是否支持重做
   */
  @derive
  get canRedo() {
    return this.datasource.canRedo;
  }

  /**
   * 远程协作者当前聚焦的节点和信息
   */
  @derive
  get remoteFocusing(): { user: IUser; node: BaseNode; timestamp: number }[] {
    return this.awarenessRegistry.remoteStates
      .filter(i => i.state?.focusingNodeId && this.index.getNodeById(i.state.focusingNodeId) && i.user)
      .map(i => {
        return {
          user: i.user!,
          node: this.index.getNodeById(i.state!.focusingNodeId!)!,
          timestamp: i.state!.focusingStartAt!,
        };
      });
  }

  /**
   * 聚焦的节点是否锁定了
   */
  @derive
  get isFocusingNodeLocked() {
    return !!(this.focusingNode && this.isNodeLocked(this.focusingNode));
  }

  protected disposer = new Disposer();

  constructor(inject: {
    datasource: BaseEditorDatasource;
    event: BaseEditorEvent;
    scope: BaseEditorScope;
    index: BaseEditorIndex;
    awarenessRegistry: BaseEditorAwarenessRegistry;
  }) {
    this.index = inject.index;
    this.awarenessRegistry = inject.awarenessRegistry;
    this.datasource = inject.datasource;
    this.event = inject.event;
    this.scope = inject.scope;

    makeObservable(this);
    makeAutoBindThis(this);

    this.initial();

    this.disposer.push(
      reaction(
        () => this.focusingNode,
        (node, preNode) => {
          if (node) {
            this.event.emit('NODE_ACTIVE', { node });
            this.awarenessRegistry.setState({ focusingNodeId: node.id, focusingStartAt: Date.now() });
          }

          if (preNode) {
            this.event.emit('NODE_UNACTIVE', { node: preNode });
            this.awarenessRegistry.setState({ focusingNodeId: undefined, focusingStartAt: undefined });
          }
        },
        { name: 'VIEW_STORE:WATCH_FOCUSING_NODE' }
      )
    );
  }

  dispose() {
    this.disposer.release();
  }

  async initial() {
    const state = await localforage.getItem<BaseEditorViewState>(this.cacheKey);
    if (state) {
      runInAction(() => {
        Object.assign(this.viewState, state);
      });
    }
  }

  @mutation('VIEW_STORE:SET_SELECTED')
  setSelected(params: { selected: BaseNode[] }) {
    this.selectedNodes = params.selected;
  }

  @mutation('VIEW_STORE:SET_VIEW_STATE')
  setViewState<T extends keyof BaseEditorViewState>(params: { key: T; value: BaseEditorViewState[T] }) {
    const { key, value } = params;

    this.viewState[key] = value;

    this.saveViewState();
  }

  isNodeFocusing(node: BaseNode) {
    return this.remoteFocusing.some(i => i.node.id === node.id);
  }

  isNodeLocked(node: BaseNode) {
    if (node.isHierarchyLocked) {
      return true;
    }

    const localState = this.awarenessRegistry.getState();
    return this.remoteFocusing.some(i => {
      const isSameNode = i.node.id === node.id;

      if (!isSameNode) {
        return false;
      }

      if (localState == null) {
        // 被占用
        return true;
      }

      // 同时占用一个节点
      // 根据占用时间比对, 谁先占用谁先编辑
      if (
        localState.focusingNodeId === node.id &&
        localState.focusingStartAt &&
        localState.focusingStartAt < i.timestamp
      ) {
        return false;
      }

      return true;
    });
  }

  protected saveViewState = debounce(() => {
    localforage.setItem(this.cacheKey, toJS(this.viewState));
  });
}
