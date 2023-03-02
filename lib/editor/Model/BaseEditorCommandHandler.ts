import { makeAutoBindThis, command, effect } from '@/lib/store';
import { debounce, booleanPredicate } from '@wakeapp/utils';
import type { Edge } from '@antv/x6';

import { BaseEditorStore } from './BaseEditorStore';
import type { PickParams, ShapeType, Properties } from './types';
import { BaseNode } from './BaseNode';
import { BaseEditorEvent } from './BaseEditorEvent';
import { BaseEditorDatasource } from './BaseEditorDatasource';
import { BaseEditorViewStore, BaseEditorViewState } from './BaseEditorViewStore';
import { BaseEditorIndex } from './BaseEditorIndex';

/**
 * 用于统一处理 View 层的命令
 */
export class BaseEditorCommandHandler {
  private store: BaseEditorStore;
  private viewStore: BaseEditorViewStore;
  private event: BaseEditorEvent;
  private datasource: BaseEditorDatasource;
  private index: BaseEditorIndex;

  constructor(inject: {
    event: BaseEditorEvent;
    store: BaseEditorStore;
    viewStore: BaseEditorViewStore;
    datasource: BaseEditorDatasource;
    index: BaseEditorIndex;
  }) {
    const { store, event, datasource, viewStore, index } = inject;
    this.store = store;
    this.viewStore = viewStore;
    this.event = event;
    this.datasource = datasource;
    this.index = index;

    makeAutoBindThis(this);
  }

  @command('UNDO')
  undo() {
    this.datasource.undo();
  }

  @command('REDO')
  redo() {
    this.datasource.redo();
  }

  @command('LOCK')
  lock(params: PickParams<BaseEditorStore['lock']>) {
    this.store.lock(params);
  }

  @command('UNLOCK')
  unlock(params: PickParams<BaseEditorStore['unlock']>) {
    this.store.unlock(params);
  }

  @command('SET_SELECTED')
  setSelected(params: PickParams<BaseEditorViewStore['setSelected']>) {
    this.viewStore.setSelected(params);
  }

  @command('SET_VIEW_STATE')
  setViewState<T extends keyof BaseEditorViewState>(params: { key: T; value: BaseEditorViewState[T] }) {
    this.viewStore.setViewState(params);
  }

  setViewStateDebounce = debounce(
    <T extends keyof BaseEditorViewState>(params: { key: T; value: BaseEditorViewState[T] }) => {
      this.setViewState(params);
    },
    500,
    // Leading 可以较快响应到页面上
    { leading: true }
  );

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

    // 先移除引用关系
    if (node.parent) {
      this.store.removeChild({ parent: node.parent, child: node });
    }

    // 移除节点
    this.store.removeNode({ node });

    const edges = this.getEdges(node);

    // 删除边
    if (edges.length) {
      for (const edge of edges) {
        this.removeNode({ node: edge });
      }
    }

    // 这里的的顺序很重要
    // 先删除父节点，后删除子节点，当执行撤销时顺序也是一样的，先创建父节点，后创建子节点
    // 深度优先递归删除
    if (node.children.length) {
      const clone = node.children.slice(0);
      for (const child of clone) {
        this.removeNode({ node: child });
      }
    }

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

  @command('UPDATE_NODE_PROPERTY')
  updateNodeProperty(params: { node: BaseNode; path: string; value: any }) {
    this.store.updateNodeProperty(params);
  }

  updateNodePropertyDebounced = debounce(
    (params: { node: BaseNode; path: string; value: any }) => {
      this.updateNodeProperty(params);
    },
    300,
    { leading: true }
  );

  @command('DELETE_NODE_PROPERTY')
  deleteNodeProperty(params: { node: BaseNode; path: string }) {
    this.store.deleteNodeProperty(params);
  }

  /**
   * 聚焦节点
   * @param params
   */
  @effect('FOCUS_NODE')
  focusNode(params: { node: BaseNode }) {
    this.event.emit('CMD_FOCUS_NODE', params);
  }

  /**
   * 获取和应用节点关联的边
   * @param node
   */
  protected getEdges(node: BaseNode): BaseNode[] {
    let edges: BaseNode[] = [];

    for (const n of this.index.getNodes()) {
      if (n.type !== 'edge') {
        continue;
      }

      const { target, source } = n.properties as unknown as {
        target?: Edge.TerminalData;
        source?: Edge.TerminalData;
      };

      if (this.isTerminalDataEqual(target, node) || this.isTerminalDataEqual(source, node)) {
        edges.push(n);
      }
    }

    return edges;
  }

  /**
   * 判断边终端是否相等
   * @param t
   * @param node
   * @returns
   */
  protected isTerminalDataEqual(t: Edge.TerminalData | undefined, node: BaseNode) {
    if (t == null) {
      return false;
    }

    if ('cell' in t) {
      const cell = t.cell;
      if (typeof cell === 'string') {
        return cell === node.id;
      } else {
        return cell.id === node.id;
      }
    }

    return false;
  }

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
