import { BaseEditorEvent } from './BaseEditorEvent';
import { BaseNode } from './BaseNode';

/**
 * 编辑器索引信息
 */
export class BaseEditorIndex {
  private nodeIndexById: Map<string, BaseNode> = new Map();

  private event: BaseEditorEvent;

  constructor(inject: { event: BaseEditorEvent }) {
    this.event = inject.event;

    this.event.on('NODE_CREATED', this.addNode);
    this.event.on('NODE_REMOVED', this.removeNode);
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
    this.nodeIndexById.delete(node.id);
  };
}
