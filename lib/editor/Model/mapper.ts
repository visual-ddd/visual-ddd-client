import { toJS } from 'mobx';
import { BaseNode } from './BaseNode';
import { NodePO } from './types';

/**
 * 转换为持久化对象
 */
export function toNodePO(node: BaseNode): NodePO {
  return {
    id: node.id,
    parent: node.parent?.id,
    children: node.children.map(n => n.id),
    properties: toJS(node.properties),
  };
}
