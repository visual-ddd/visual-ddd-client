import { makeObservable, observable } from 'mobx';
import { v4 } from 'uuid';
import { makeAutoBindThis, derive, mutation, runInCommand } from '@/lib/store';

import { BaseNode } from './BaseNode';
import type { Properties, ShapeType } from './types';
import { ROOT_ID } from './constants';
import { BaseEditorEvent } from './BaseEditorEvent';

/**
 * 编辑器 Store 基类
 *
 * 注意： 这里不会耦合视图相关内容
 * - mutation 由 BaseEditorCommandHandler 或 BaseEditorDatasource 来统一调用，BaseEditorCommandHandler 在调用之前会进行一些校验
 * - mutation 应该覆盖单一职责，保持原子化，一次只操作一个对象
 */
export class BaseEditorStore {
  /**
   * 根节点, 核心树
   */
  @observable
  readonly root!: BaseNode;

  /**
   * 根节点
   */
  @derive
  get nodes(): BaseNode[] {
    return this.root.children;
  }

  private event: BaseEditorEvent;

  constructor(inject: { event: BaseEditorEvent }) {
    this.event = inject.event;

    runInCommand('INITIAL_STORE', () => {
      // 这里必须使用 createNode, 因为 根节点 也需要通知 index 进行缓存
      // 注意：这里的 create 事件不会被 datasource 监听到，因为它在当前类之后初始化
      // @ts-expect-error
      this.root = this.createNode({ name: ROOT_ID, type: 'node', id: ROOT_ID, properties: {} });
    });

    makeObservable(this);
    makeAutoBindThis(this);
  }

  @mutation('APPEND_CHILD')
  appendChild(params: { child: BaseNode; parent?: BaseNode }) {
    const { child, parent } = params;

    const realParent = parent ?? this.root;
    const appended = realParent.appendChild(child);

    if (appended) {
      this.event.emit('NODE_APPEND_CHILD', { parent: realParent, child });
    }
  }

  @mutation('REMOVE_CHILD')
  removeChild(params: { parent: BaseNode; child: BaseNode }): void {
    const { parent, child } = params;

    this.event.emit('NODE_BEFORE_REMOVE_CHILD', { parent, child });

    const removed = parent.removeChild(child);

    if (removed) {
      this.event.emit('NODE_REMOVE_CHILD', { parent, child });
    }
  }

  @mutation('CREATE_NODE')
  createNode(params: { name: string; type: ShapeType; id?: string; properties: Properties }) {
    // 忽略根节点, 根节点默认创建
    if (params.id === ROOT_ID && this.root) {
      return this.root;
    }

    const node = this.nodeFactory(params.name, params.id, params.type);

    Object.assign(node.properties, params.properties);
    this.event.emit('NODE_CREATED', { node });

    return node;
  }

  @mutation('REMOVE_NODE')
  removeNode(params: { node: BaseNode }) {
    const { node } = params;

    this.event.emit('NODE_REMOVED', { node });
  }

  /**
   * 更新 Node Properties
   * @param params
   */
  @mutation('UPDATE_NODE_PROPERTY')
  updateNodeProperty(params: { node: BaseNode; path: string; value: any }) {
    const { node, path, value } = params;

    this.event.emit('NODE_BEFORE_UPDATE_PROPERTY', { node, path, value });

    const changed = node.setProperty(path, value);
    if (changed) {
      this.event.emit('NODE_UPDATE_PROPERTY', { node, path, value });
    }
  }

  @mutation('DELETE_NODE_PROPERTY')
  deleteNodeProperty(params: { node: BaseNode; path: string }) {
    const { node, path } = params;
    const deleted = node.deleteProperty(path);

    if (deleted) {
      this.event.emit('NODE_DELETE_PROPERTY', { node, path });
    }
  }

  /**
   * 节点工厂
   * 可以在子类中覆盖
   */
  protected nodeFactory(name: string, id?: string, type?: ShapeType): BaseNode {
    const node = new BaseNode(name, id ?? v4(), type);
    return node;
  }
}
