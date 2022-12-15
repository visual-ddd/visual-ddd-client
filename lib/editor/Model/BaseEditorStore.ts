import { makeObservable, observable } from 'mobx';
import { v4 } from 'uuid';
import { set } from '@wakeapp/utils';
import { autoBindThis, derive, mutation } from '@/lib/store';

import { BaseNode } from './BaseNode';
import type { Properties, ShapeType } from './types';
import { BaseEditorCommandHandler } from './BaseEditorCommandHandler';
import { BaseEditorIndex } from './BaseEditorIndex';
import { ROOT_ID } from './constants';

/**
 * 编辑器 Store 基类
 *
 * 注意： 这里不会耦合视图相关内容
 * - mutation 由 BaseEditorCommandHandler 来统一调用，BaseEditorCommandHandler 在调用之前会进行一些校验
 */
export class BaseEditorStore {
  /**
   * 命令处理器
   */
  readonly commandHandler: BaseEditorCommandHandler;

  /**
   * 根节点
   */
  @observable
  readonly root: BaseNode;

  /**
   * 根节点
   */
  @derive
  get nodes(): BaseNode[] {
    return this.root.children;
  }

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
   * 索引信息
   */
  private index: BaseEditorIndex;

  constructor() {
    // 后续支持子类继承
    this.commandHandler = new BaseEditorCommandHandler(this);
    this.index = new BaseEditorIndex(this.commandHandler);
    this.root = this.nodeFactory(ROOT_ID, ROOT_ID);

    makeObservable(this);
    autoBindThis(this);
  }

  // TODO: 触发 actions
  @mutation('APPEND_CHILD')
  appendChild(params: { child: BaseNode; parent?: BaseNode }) {
    const { child, parent } = params;

    // reset references
    this.removeChild(child);

    // append
    const realParent = parent ?? this.root;
    realParent.appendChild(child);
  }

  @mutation('CREATE_NODE')
  createNode(params: { name: string; type: ShapeType; id?: string; properties: Properties; parent?: BaseNode }) {
    const node = this.nodeFactory(params.name, params.id, params.type);

    Object.assign(node.properties, params.properties);

    this.appendChild({ child: node, parent: params.parent });

    return node;
  }

  @mutation('MOVE_NODE')
  moveNode(params: { child: BaseNode; parent?: BaseNode }) {
    this.appendChild(params);
  }

  @mutation('SET_SELECTED')
  setSelected(params: { selected: BaseNode[] }) {
    this.selectedNodes = params.selected;
  }

  @mutation('REMOVE_NODE')
  removeNode(params: { node: BaseNode }) {
    const { node } = params;

    // 移除引用关系
    this.removeChild(node);
  }

  /**
   * 更新 Node Properties
   * @param params
   */
  @mutation('UPDATE_NODE_PROPERTY')
  updateNodeProperty(params: { node: BaseNode; path: string; value: any }) {
    const { node, path, value } = params;
    set(node.properties, path, value);
  }

  /**
   * 通过 id 获取节点
   * @param id
   * @returns
   */
  getNodeById(id: string) {
    return this.index.getNodeById(id);
  }

  /**
   * 节点工厂
   * 可以在子类中覆盖
   */
  protected nodeFactory(name: string, id?: string, type?: ShapeType): BaseNode {
    const node = new BaseNode(name, id ?? v4(), type);
    return node;
  }

  private removeChild(child: BaseNode): void {
    child.parent?.removeChild(child);
  }
}
