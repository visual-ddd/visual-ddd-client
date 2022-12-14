import { derive } from '@/lib/store';
import { makeObservable, observable } from 'mobx';
import type { BaseNodeProperties, Properties, ShapeType } from './types';

/**
 * 节点基类
 *
 * 原则：
 * 实体仅处理当前的逻辑，不处理跨域实体实例的逻辑
 * 变更方法状态的方法只能被 Store 的 mutation 调用
 */
export class BaseNode {
  static isEqual(a: BaseNode, b: BaseNode) {
    return a.id === b.id;
  }

  /**
   * 图形组件名称
   */
  readonly name: string;

  /** */
  readonly type: ShapeType;

  /**
   * 唯一标识符
   */
  readonly id: string;

  /**
   * 父节点
   */
  @observable.ref
  parent?: this;

  /**
   * 子节点
   */
  @observable
  readonly children: this[] = [];

  /**
   * 属性配置
   */
  @observable
  readonly properties: BaseNodeProperties;

  /**
   * 节点深度
   */
  @derive
  get depth(): number {
    return this.parent == null ? 0 : this.parent.depth + 1;
  }

  constructor(name: string, id: string, type: ShapeType = 'node') {
    this.name = name;
    this.id = id;
    this.type = type;

    this.properties = {
      // 冗余字段，方便从 x6 cell 中恢复
      __node_name__: name,
      __node_type__: type,
    };

    makeObservable(this);
  }

  appendChild(node: this) {
    const idx = this.getNodeIdx(node);

    if (idx === -1) {
      this.children.push(node);
      node.parent = this;
    }
  }

  removeChild(node: this) {
    const idx = this.getNodeIdx(node);
    if (idx !== -1) {
      this.children.splice(idx, 1);
    }
  }

  /**
   * 是否包含给定的子节点
   */
  contains(node: this): boolean {
    let current: this | undefined = node;

    while (current) {
      if (BaseNode.isEqual(this, current)) {
        return true;
      }

      current = current.parent;
    }

    return false;
  }

  private getNodeIdx(node: this) {
    return this.children.findIndex(child => BaseNode.isEqual(node, child));
  }
}
