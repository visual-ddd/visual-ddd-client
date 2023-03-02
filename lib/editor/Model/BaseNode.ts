import { derive } from '@/lib/store';
import { makeObservable, observable } from 'mobx';
import { set, get } from '@wakeapp/utils';

import { getPaths, unset } from '@/lib/utils';

import type { BaseNodeProperties, ShapeType } from './types';
import { ROOT_ID } from './constants';

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

  /**
   * 图形的类型
   */
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
   * 是否锁定
   */
  @observable
  locked: boolean = false;

  /**
   * 层次锁定，即父节点锁定了，下级节点也会被锁定
   */
  @derive
  get isHierarchyLocked() {
    if (this.locked) {
      return true;
    }

    return !!this.parent?.locked;
  }

  /**
   * 节点深度
   */
  @derive
  get depth(): number {
    return this.parent == null ? 0 : this.parent.depth + 1;
  }

  /**
   * 是否有父节点(根节点是一个虚拟节点)
   */
  @derive
  get hasParent() {
    return this.parent && this.parent.id !== ROOT_ID;
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

  lock() {
    if (!this.locked) {
      this.locked = true;
      return true;
    }

    return false;
  }

  unlock() {
    if (this.locked) {
      this.locked = false;
      return true;
    }
    return false;
  }

  /**
   * 更新属性
   * @param path
   * @param value
   * @returns
   */
  setProperty(path: string, value: any): boolean {
    const pathInArray = getPaths(path);
    const oldValue = get(this.properties, pathInArray);

    if (oldValue === value) {
      return false;
    }

    set(this.properties, pathInArray, value);

    return true;
  }

  /**
   * 删除属性
   * @param path
   */
  deleteProperty(path: string): boolean {
    return unset(this.properties, path);
  }

  /**
   * 获取属性
   * @param path
   * @returns
   */
  getProperty(path: string): any {
    return get(this.properties, getPaths(path));
  }

  /**
   * 添加子节点
   * @param node
   * @returns 如果添加成功则返回 true
   */
  appendChild(node: this) {
    const idx = this.getNodeIdx(node);

    if (idx === -1) {
      this.children.push(node);
      node.setParent(this);

      return true;
    } else if (node.parent !== this) {
      // 确保 parent 等于自己
      node.setParent(this);
    }

    return false;
  }

  /**
   * 删除子节点
   * @param node
   * @returns 删除成功则返回 true
   */
  removeChild(node: this) {
    const idx = this.getNodeIdx(node);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      if (node.parent === this) {
        node.parent = undefined;
      }

      return true;
    }

    return false;
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

  /**
   * 递归遍历
   */
  walk(visitor: (node: this) => void) {
    visitor(this);
    if (this.children.length) {
      for (const child of this.children) {
        child.walk(visitor);
      }
    }
  }

  private setParent(parent: this) {
    if (this.parent === parent) {
      return;
    }

    // 先确保移除
    if (this.parent && this.parent !== parent) {
      this.parent.removeChild(this);
    }

    this.parent = parent;
  }

  private getNodeIdx(node: this) {
    return this.children.findIndex(child => BaseNode.isEqual(node, child));
  }
}
