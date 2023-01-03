import { action, makeObservable, observable } from 'mobx';
import type { FormItemValidateStatus } from './types';
import { toPathArray } from './utils';

/**
 * 状态存储树
 * 主要用于加快状态的查找速度
 */
class TreeNode {
  path: string;

  /**
   * 当前状态
   */
  @observable
  status: FormItemValidateStatus | undefined;

  /**
   * 子节点
   */
  @observable.shallow
  children: Map<string, TreeNode> = new Map();

  constructor(path: string) {
    this.path = path;

    makeObservable(this);
  }
}

export class StatusTree {
  /**
   * 根节点
   */
  private root: TreeNode = new TreeNode('');

  constructor(
    private options: {
      /**
       * 状态添加
       * @param path
       * @param status
       */
      onAdd(path: string, status: FormItemValidateStatus): void;

      /**
       * 状态移除
       * @param path
       */
      onRemove(path: string): void;

      /**
       * 状态更新
       * @param path
       * @param status
       */
      onUpdate(path: string, status: FormItemValidateStatus): void;
    }
  ) {
    makeObservable(this);
  }

  /**
   * 查找指定路径的状态
   * @param path
   */
  find(path: string): FormItemValidateStatus | undefined {
    const node = this.findNode(path);

    return node?.status;
  }

  /**
   * 查找指定路径的状态, 并包括所有下级的状态
   * @param path
   */
  findRecursive(path: string): FormItemValidateStatus[] {
    const node = this.findNode(path);
    const list: FormItemValidateStatus[] = [];

    const walk = (current: TreeNode) => {
      if (current.status) {
        list.push(current.status);
      }

      for (const child of current.children.values()) {
        walk(child);
      }
    };

    if (node) {
      walk(node);
    }

    return list;
  }

  /**
   * 新增状态
   * @param path
   * @param status
   */
  @action.bound
  addStatus(path: string, status: FormItemValidateStatus) {
    const node = this.createNode(path);

    let oldStatus = node.status;

    node.status = status;

    if (oldStatus) {
      this.options.onUpdate(path, status);
    } else {
      this.options.onAdd(path, status);
    }
  }

  /**
   * 移除指定路径的状态
   * @param path
   * @param recursive
   */
  @action.bound
  removeStatus(path: string, recursive: boolean = false) {
    const node = this.findNode(path);

    if (!node) {
      return;
    }

    const walk = (node: TreeNode, recursive: boolean) => {
      if (node.status) {
        node.status = undefined;
        this.options.onRemove(node.path);
      }

      if (recursive) {
        for (const child of node.children.values()) {
          walk(child, recursive);
        }
      }
    };

    walk(node, recursive);
  }

  /**
   * 清除所有状态
   */
  clearAll() {
    this.removeStatus('', true);
  }

  @action.bound
  private createNode(path: string): TreeNode {
    const paths = toPathArray(path);

    let current: TreeNode = this.root;

    let currentPath = '';

    for (const p of paths) {
      currentPath = currentPath !== '' ? currentPath + '.' + p : p;
      if (current.children.has(p)) {
        current = current.children.get(p)!;
      } else {
        const newNode = new TreeNode(currentPath);
        current.children.set(p, newNode);
        current = newNode;
      }
    }

    return current;
  }

  private findNode(path: string): TreeNode | undefined {
    const paths = toPathArray(path);

    let current: TreeNode | undefined = this.root;

    for (const p of paths) {
      if (current == null) {
        return undefined;
      }

      current = current.children.get(p);
    }

    return current;
  }
}
