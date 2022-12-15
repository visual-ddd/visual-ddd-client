import { autoBindThis, command } from '@/lib/store';
import { debounce, booleanPredicate, EventEmitter } from '@wakeapp/utils';

import { BaseEditorStore } from './BaseEditorStore';
import { ShapeRegistry } from '../Shape';
import type { Disposer, PickParams } from './types';
import { BaseNode } from './BaseNode';

/**
 * 编辑器事件
 */
export interface BaseEditorEvents {
  UNSELECT_ALL: void;
  UNREMOVABLE: void;
  COPY: void;
  PASTE: void;
  NODE_REMOVED: { node: BaseNode };
  NODE_CREATED: { node: BaseNode };
}

export type BaseEditorEventsWithoutArg = keyof {
  [P in keyof BaseEditorEvents as BaseEditorEvents[P] extends void ? P : never]: void;
};

export type BaseEditorEventsWithArg = Exclude<keyof BaseEditorEvents, BaseEditorEventsWithoutArg>;

/**
 * 用于统一处理 View 层的命令
 */
export class BaseEditorCommandHandler {
  /**
   * 图形注册器、管理器
   */
  readonly shapeRegistry: ShapeRegistry;

  readonly store: BaseEditorStore;

  /**
   * 暴露给 View 层的事件
   */
  private eventBus: EventEmitter = new EventEmitter();

  constructor(store: BaseEditorStore) {
    this.store = store;

    this.shapeRegistry = new ShapeRegistry(store);

    autoBindThis(this);
  }

  /**
   * 事件订阅
   * @param name
   * @param listener
   */
  on<T extends BaseEditorEventsWithoutArg>(name: T, listener: () => void): Disposer;
  on<T extends BaseEditorEventsWithArg>(name: T, listener: (arg: BaseEditorEvents[T]) => void): Disposer;
  on(name: string, listener: (args: any) => void): Disposer {
    this.eventBus.on(name, listener);

    return () => {
      this.eventBus.off(name, listener);
    };
  }

  @command('SET_SELECTED')
  setSelected(params: PickParams<BaseEditorStore['setSelected']>) {
    this.store.setSelected(params);
  }

  @command('CREATE_NODE')
  createNode(params: PickParams<BaseEditorStore['createNode']>) {
    const node = this.store.createNode(params);
    this.emit('NODE_CREATED', { node });
  }

  @command('MOVE_NODE')
  moveNode(params: PickParams<BaseEditorStore['moveNode']>) {
    this.store.moveNode(params);
  }

  @command('REMOVE_NODE')
  removeNode(params: { node: BaseNode; checkValidate?: boolean }) {
    const { node, checkValidate = true } = params;

    if (checkValidate && this.hasUnremovableNode(node)) {
      this.emit('UNREMOVABLE');
      return false;
    }

    // 深度优先递归删除
    if (node.children.length) {
      const clone = node.children.slice(0);
      for (const child of clone) {
        this.removeNode({ node: child, checkValidate: false });
      }
    }

    this.store.removeNode({ node });

    this.emit('NODE_REMOVED', { node });

    return true;
  }

  @command('REMOVE_SELECTED')
  removeSelected() {
    const selected = this.store.selectedNodes;
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
      this.removeNode({ node: item, checkValidate: false });
    }

    // 清空选择
    this.emit('UNSELECT_ALL');

    return true;
  }

  @command('COMMAND_UPDATE_NODE_PROPERTY')
  updateNodeProperty(params: { node: BaseNode; path: string; value: any }) {
    this.store.updateNodeProperty(params);
  }

  updateNodePropertyDebounced = debounce((params: { node: BaseNode; path: string; value: any }) => {
    this.updateNodeProperty(params);
  });

  @command('COPY')
  copy() {
    this.emit('COPY');
  }

  @command('PASTE')
  paste() {
    this.emit('PASTE');
  }

  /**
   * 事件触发
   * @param name
   */
  private emit<T extends BaseEditorEventsWithoutArg>(name: T): void;
  private emit<T extends BaseEditorEventsWithArg>(name: T, arg: BaseEditorEvents[T]): void;
  private emit(name: string, args?: any): void {
    this.eventBus.emit(name, args);
  }

  protected hasUnremovableNode = (node: BaseNode): boolean => {
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
  protected flatNodes(nodes: BaseNode[]): BaseNode[] {
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
