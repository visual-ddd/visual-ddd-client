import { observable } from 'mobx';
import { BaseEditorEvent } from './BaseEditorEvent';
import { BaseNode } from './BaseNode';

/**
 * 编辑器索引信息
 */
export class BaseEditorIndex {
  @observable.shallow
  private nodeIndexById: Map<string, BaseNode> = new Map();

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
    return this.nodeIndexById.get(id);
  }

  private addNode = (params: { node: BaseNode }) => {
    const { node } = params;
    this.nodeIndexById.set(node.id, node);
  };

  private removeNode = (params: { node: BaseNode }) => {
    const { node } = params;
    // 删除可以延迟一些
    requestAnimationFrame(() => {
      // 有可能重新创建了新的 node
      const currentNode = this.nodeIndexById.get(node.id);
      if (currentNode === node) {
        this.nodeIndexById.delete(node.id);
      }
    });
  };
}
