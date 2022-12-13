import { makeObservable, observable } from 'mobx';
import { v4 } from 'uuid';

import { BaseNode } from './BaseNode';
import { derive, mutation } from '@/lib/store';
import type { Properties } from './types';
import { ShapeRegistry } from '../Shape';

/**
 * 编辑器 Store 基类
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

  @observable
  private nodeIndexById: Map<string, BaseNode> = new Map();

  constructor() {
    this.shapeRegistry = new ShapeRegistry(this);

    makeObservable(this);
  }

  @mutation('APPEND_CHILD')
  appendChild = (params: { child: BaseNode; parent?: BaseNode }) => {
    const { child, parent } = params;
    // TODO: 触发 actions

    // reset references
    if (child.parent) {
      child.parent.removeChild(child);
    } else {
      const idx = this.nodes.indexOf(child);
      if (idx !== -1) {
        this.nodes.splice(idx, 1);
      }
    }

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

  /**
   * 通过 id 获取节点
   * @param id
   * @returns
   */
  getNodeById(id: string) {
    return this.nodeIndexById.get(id);
  }

  /**
   * 节点工厂
   */
  protected nodeFactory(type: string, id?: string): BaseNode {
    const node = new BaseNode(type, id ?? v4());
    return node;
  }
}
