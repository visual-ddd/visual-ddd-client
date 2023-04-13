import { observable, runInAction } from 'mobx';
import { debounce } from '@wakeapp/utils';
import { tryDispose } from '@/lib/utils';

import { BaseEditorEvent } from './BaseEditorEvent';
import { BaseNode } from './BaseNode';
import { ROOT_ID } from './constants';

/**
 * 编辑器索引信息
 */
export class BaseEditorIndex {
  @observable.shallow
  private nodeIndexById: Map<string, BaseNode> = new Map();

  /**
   * 即将删除的节点
   */
  @observable.shallow
  private nodeWillBeRemoved: Map<string, BaseNode> = new Map();

  private event: BaseEditorEvent;

  constructor(inject: { event: BaseEditorEvent }) {
    this.event = inject.event;

    this.event.on('NODE_CREATED', this.addNode);
    this.event.on('NODE_REMOVED', this.removeNode);
  }

  /**
   * 获取所有节点
   * @returns
   */
  getNodes() {
    return Array.from(this.nodeIndexById.values());
  }

  /**
   * 通过 id 获取节点
   * @param id
   * @returns
   */
  getNodeById(id: string) {
    return this.nodeIndexById.get(id) || this.nodeWillBeRemoved.get(id);
  }

  /**
   * 获取悬挂节点
   */
  getDangleNodes() {
    const nodes = this.getNodes();
    // 没有父节点也没有作为任何节点的子节点
    const nodesWithoutParent = nodes.filter(node => !node.parent && node.id !== ROOT_ID);
    const dangleNodes: BaseNode[] = [];

    for (const node of nodesWithoutParent) {
      const parent = nodes.find(n => n.children.find(c => BaseNode.isEqual(c, node)));
      if (!parent) {
        dangleNodes.push(node);
      }
    }

    return dangleNodes;
  }

  private addNode = (params: { node: BaseNode }) => {
    const { node } = params;
    this.nodeIndexById.set(node.id, node);
  };

  private removeNode = (params: { node: BaseNode }) => {
    const { node } = params;
    const currentNode = this.nodeIndexById.get(node.id);

    if (currentNode) {
      const willRemoveNode = this.nodeWillBeRemoved.get(node.id);
      this.nodeWillBeRemoved.set(node.id, currentNode);
      this.nodeIndexById.delete(node.id);

      if (willRemoveNode) {
        tryDispose(willRemoveNode);
      }

      this.gc();
    }
  };

  private gc = debounce(() => {
    runInAction(() => {
      this.nodeWillBeRemoved.forEach(m => tryDispose(m));
      this.nodeWillBeRemoved.clear();
    });
  }, 2000);
}
