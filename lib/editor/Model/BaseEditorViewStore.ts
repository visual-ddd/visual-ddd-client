import { makeObservable, observable, reaction } from 'mobx';
import { makeAutoBindThis, derive, mutation } from '@/lib/store';

import { BaseEditorDatasource } from './BaseEditorDatasource';
import { BaseNode } from './BaseNode';
import { BaseEditorEvent } from './BaseEditorEvent';

export interface BaseEditorViewState {
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
 * 这里放置非核心的视图状态
 */
export class BaseEditorViewStore {
  private datasource: BaseEditorDatasource;
  private event: BaseEditorEvent;

  /**
   * 编辑器视图状态
   */
  @observable
  viewState: BaseEditorViewState = {
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

  @derive
  get canRemove() {
    return !!this.selectedNodes.length;
  }

  constructor(inject: { datasource: BaseEditorDatasource; event: BaseEditorEvent }) {
    this.datasource = inject.datasource;
    this.event = inject.event;

    makeObservable(this);
    makeAutoBindThis(this);

    reaction(
      () => this.focusingNode,
      (node, preNode) => {
        if (node) {
          this.event.emit('NODE_ACTIVE', { node });
        }

        if (preNode) {
          this.event.emit('NODE_UNACTIVE', { node: preNode });
        }
      },
      { name: 'VIEW_STORE:WATCH_FOCUSING_NODE' }
    );
  }

  @mutation('VIEW_STORE:SET_SELECTED')
  setSelected(params: { selected: BaseNode[] }) {
    this.selectedNodes = params.selected;
  }

  @mutation('VIEW_STORE:SET_VIEW_STATE')
  setViewState<T extends keyof BaseEditorViewState>(params: { key: T; value: BaseEditorViewState[T] }) {
    const { key, value } = params;

    this.viewState[key] = value;
  }
}
