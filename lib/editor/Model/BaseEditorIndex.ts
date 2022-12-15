import { BaseEditorCommandHandler } from './BaseEditorCommandHandler';
import { BaseNode } from './BaseNode';

/**
 * 编辑器索引信息
 */
export class BaseEditorIndex {
  private nodeIndexById: Map<string, BaseNode> = new Map();

  private commandHandler: BaseEditorCommandHandler;

  constructor(commandHandler: BaseEditorCommandHandler) {
    this.commandHandler = commandHandler;

    this.commandHandler.on('NODE_CREATED', this.addNode);
    this.commandHandler.on('NODE_REMOVED', this.removeNode);
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
