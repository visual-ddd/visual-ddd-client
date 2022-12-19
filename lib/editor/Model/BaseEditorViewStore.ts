import { makeObservable, observable } from 'mobx';
import { makeAutoBindThis, derive, mutation } from '@/lib/store';

import { BaseEditorDatasource } from './BaseEditorDatasource';
import { BaseNode } from './BaseNode';

export interface BaseEditorViewState {
  shapeLibraryFolded: boolean;
}

/**
 * 这里放置非核心的视图状态
 */
export class BaseEditorViewStore {
  private datasource: BaseEditorDatasource;

  /**
   * 编辑器视图状态
   */
  @observable
  viewState: BaseEditorViewState = {
    shapeLibraryFolded: false,
  };

  /**
   * 已选中的节点
   */
  @observable
  selectedNodes: BaseNode[] = [];

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

  constructor(inject: { datasource: BaseEditorDatasource }) {
    this.datasource = inject.datasource;

    makeObservable(this);
    makeAutoBindThis(this);
  }

  @mutation('SET_SELECTED')
  setSelected(params: { selected: BaseNode[] }) {
    this.selectedNodes = params.selected;
  }

  @mutation('SET_VIEW_STATE')
  setViewState<T extends keyof BaseEditorViewState>(params: { key: T; value: BaseEditorViewState[T] }) {
    const { key, value } = params;

    this.viewState[key] = value;
  }
}
