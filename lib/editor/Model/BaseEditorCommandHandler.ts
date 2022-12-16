import { autoBindThis, command } from '@/lib/store';
import { debounce, booleanPredicate } from '@wakeapp/utils';

import { BaseEditorStore } from './BaseEditorStore';
import type { PickParams, ShapeType, Properties } from './types';
import { BaseNode } from './BaseNode';
import { BaseEditorEvent } from './BaseEditorEvent';
import { BaseEditorDatasource } from './BaseEditorDatasource';

/**
 * 用于统一处理 View 层的命令
 */
export class BaseEditorCommandHandler {
  private store: BaseEditorStore;
  private event: BaseEditorEvent;
  private datasource: BaseEditorDatasource;

  constructor(inject: { event: BaseEditorEvent; store: BaseEditorStore; datasource: BaseEditorDatasource }) {
    const { store, event, datasource } = inject;
    this.store = store;
    this.event = event;
    this.datasource = datasource;

    autoBindThis(this);
  }

  @command('UNDO')
  undo() {
    this.datasource.undo();
  }

  @command('REDO')
  redo() {
    this.datasource.redo();
  }

  @command('SET_SELECTED')
  setSelected(params: PickParams<BaseEditorStore['setSelected']>) {
    this.store.setSelected(params);
  }

  @command('CREATE_NODE')
  createNode(params: { name: string; type: ShapeType; id?: string; properties: Properties; parent?: BaseNode }) {
    const node = this.store.createNode(params);

    // 更新引用关系
    this.store.appendChild({ child: node, parent: params.parent });

    return node;
  }

  @command('MOVE_NODE')
  moveNode(params: { child: BaseNode; parent?: BaseNode }) {
    const { child, parent } = params;

    const from = child.parent;
    // reset old references
    if (from) {
      this.store.removeChild({ parent: from, child });
    }

    // move to new parent
    this.store.appendChild({ parent, child });

    this.event.emit('NODE_MOVE', { from, node: child, to: parent });
  }

  @command('REMOVE_NODE')
  removeNode(params: { node: BaseNode }) {
    const { node } = params;

    // 深度优先递归删除
    if (node.children.length) {
      const clone = node.children.slice(0);
      for (const child of clone) {
        this.removeNode({ node: child });
      }
    }

    // 先移除引用关系
    if (node.parent) {
      this.store.removeChild({ parent: node.parent, child: node });
    }

    // 移除节点
    this.store.removeNode({ node });

    return true;
  }

  /**
   * 批量删除
   * @param context
   * @returns
   */
  @command('REMOVE_BATCHED')
  removeBatched(context: { nodes: BaseNode[] }) {
    // 需要进行合并，比如包含了公共节点，需要进行删除
    const flattened = this.flatNodes(context.nodes);

    // 删除
    for (const item of flattened) {
      this.removeNode({ node: item });
    }

    return true;
  }

  @command('COMMAND_UPDATE_NODE_PROPERTY')
  updateNodeProperty(params: { node: BaseNode; path: string; value: any }) {
    this.store.updateNodeProperty(params);
  }

  updateNodePropertyDebounced = debounce((params: { node: BaseNode; path: string; value: any }) => {
    this.updateNodeProperty(params);
  });

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