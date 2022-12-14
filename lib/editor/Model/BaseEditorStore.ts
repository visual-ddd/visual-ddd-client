import { makeObservable, observable } from 'mobx';
import { v4 } from 'uuid';
import { booleanPredicate, EventEmitter, debounce, set } from '@wakeapp/utils';

import { BaseNode } from './BaseNode';
import { derive, mutation } from '@/lib/store';
import type { Disposer, Properties } from './types';
import { ShapeRegistry } from '../Shape';

/**
 * 编辑器 Store 基类
 *
 * 注意： 这里不会耦合视图相关内容
 */
export class BaseEditorStore {
  /**
   * 图形注册器、管理器
   */
  readonly shapeRegistry: ShapeRegistry;

  /**
   * 根节点
   */
  @observable
  nodes: BaseNode[] = [];

  /**
   * 已选中的节点
   */
  @observable
  selectedNodes: BaseNode[] = [];

  @observable
  private nodeIndexById: Map<string, BaseNode> = new Map();

  private eventBus: EventEmitter = new EventEmitter();

  /**
   * 当前聚焦的节点(单一节点)
   */
  @derive
  get focusingNode() {
    return this.selectedNodes.length === 1 ? this.selectedNodes[0] : null;
  }

  constructor() {
    this.shapeRegistry = new ShapeRegistry(this);

    makeObservable(this);
  }

  @mutation('APPEND_CHILD')
  appendChild = (params: { child: BaseNode; parent?: BaseNode }) => {
    const { child, parent } = params;
    // TODO: 触发 actions

    // reset references
    this.removeChild(child);

    // append
    if (parent) {
      parent.appendChild(child);
    } else {
      this.nodes.push(child);
      child.parent = undefined;
    }
  };

  @mutation('CREATE_NODE')
  createNode = (params: { type: string; id?: string; properties: Properties; parent?: BaseNode }) => {
    const node = this.nodeFactory(params.type, params.id);
    node.properties = params.properties;

    // 索引
    this.nodeIndexById.set(node.id, node);

    this.appendChild({ child: node, parent: params.parent });
  };

  @mutation('MOVE_NODE')
  moveNode = (params: { child: BaseNode; parent?: BaseNode }) => {
    this.appendChild(params);
  };

  @mutation('SET_SELECTED')
  setSelected = (params: { selected: BaseNode[] }) => {
    this.selectedNodes = params.selected;
  };

  @mutation('REMOVE_NODE')
  removeNode = (params: { node: BaseNode }, checkValidate = true) => {
    const { node } = params;

    if (checkValidate && this.hasUnremovableNode(node)) {
      this.emit('UNREMOVABLE');
      return false;
    }

    // 深度优先删除
    if (node.children.length) {
      const clone = node.children.slice(0);
      for (const child of clone) {
        this.removeNode({ node: child }, false);
      }
    }

    // 移除引用关系
    this.removeChild(node);

    // 移除索引
    this.nodeIndexById.delete(node.id);

    this.emit('NODE_REMOVED', { node });

    return true;
  };

  @mutation('REMOVE_SELECTED')
  removeSelected = () => {
    const selected = this.selectedNodes;
    if (!selected.length) {
      return false;
    }

    if (selected.some(this.hasUnremovableNode)) {
      this.emit('UNREMOVABLE');
      return false;
    }

    // 需要进行合并，比如包含了公共节点，需要进行删除
    const flattened = this.flatNodes(selected);

    // 删除
    for (const item of flattened) {
      this.removeNode({ node: item });
    }

    // 清空选择
    this.emit('UNSELECT_ALL');

    return true;
  };

  /**
   * 更新 Node Properties
   * @param params
   */
  @mutation('UPDATE_NODE_PROPERTY')
  updateNodeProperty = (params: { node: BaseNode; path: string; value: any }) => {
    const { node, path, value } = params;
    set(node.properties, path, value);
  };

  /**
   * 更新 Node Properties 防抖模式，适用于频繁更新的节点
   */
  @mutation('UPDATE_NODE_PROPERTY_DEBOUNCED')
  updateNodePropertyDebounced: typeof this.updateNodeProperty = debounce(params => {
    this.updateNodeProperty(params);
  }, 500);

  /**
   * 通过 id 获取节点
   * @param id
   * @returns
   */
  getNodeById(id: string) {
    return this.nodeIndexById.get(id);
  }

  /**
   * 事件订阅
   * @param name
   * @param listener
   */
  on(name: 'UNSELECT_ALL', listener: () => void): Disposer;
  on(name: 'UNREMOVABLE', listener: () => void): Disposer;
  on(name: 'NODE_REMOVED', listener: (args: { node: BaseNode }) => void): Disposer;
  on(name: string, listener: (args: any) => void): Disposer {
    this.eventBus.on(name, listener);

    return () => {
      this.eventBus.off(name, listener);
    };
  }

  /**
   * 节点工厂
   */
  protected nodeFactory(type: string, id?: string): BaseNode {
    const node = new BaseNode(type, id ?? v4());
    return node;
  }

  /**
   * 事件触发
   * @param name
   */
  private emit(name: 'UNSELECT_ALL'): void;
  private emit(name: 'UNREMOVABLE'): void;
  private emit(name: 'NODE_REMOVED', args: { node: BaseNode }): void;
  private emit(name: string, args?: any): void {
    this.eventBus.emit(name, args);
  }

  private removeChild(child: BaseNode): void {
    if (child.parent) {
      child.parent.removeChild(child);
    } else {
      const idx = this.nodes.indexOf(child);
      if (idx !== -1) {
        this.nodes.splice(idx, 1);
      }
    }
  }

  private hasUnremovableNode = (node: BaseNode): boolean => {
    if (!this.shapeRegistry.isRemovable({ model: node })) {
      return true;
    }

    if (node.children.length) {
      if (node.children.some(this.hasUnremovableNode)) {
        return true;
      }
    }

    return false;
  };

  /**
   * 节点扁平化
   * @param nodes
   * @returns
   */
  private flatNodes(nodes: BaseNode[]): BaseNode[] {
    // 按照节点深度排序
    const clone: Array<BaseNode | null> = nodes.slice(0).sort((a, b) => a.depth - b.depth);

    for (let i = 0; i < clone.length; i++) {
      const current = clone[i];

      // eslint-disable-next-line no-unmodified-loop-condition
      for (let j = i + 1; current && j < clone.length; j++) {
        const next = clone[j];
        if (next && current.contains(next)) {
          clone[j] = null;
        }
      }
    }

    return clone.filter(booleanPredicate);
  }
}
