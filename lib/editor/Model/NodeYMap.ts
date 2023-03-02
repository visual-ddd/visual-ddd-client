import { Map as YMap } from 'yjs';
import toPairs from 'lodash/toPairs';
import fromPairs from 'lodash/fromPairs';
import cloneDeep from 'lodash/cloneDeep';

import { BaseNodeProperties, NodePO } from './types';
import { ROOT_ID } from './constants';

export const MapTypeNode = '__NODE__';
export const MapTypeRoot = ROOT_ID;
export const MapTypeProperties = '__PROPERTY__';

export type { BaseNodeProperties, NodePO } from './types';

/**
 * 封装对 Node 类型 YMap 的操作
 */
export class NodeYMap {
  static fromNodePO(node: NodePO) {
    const map = new YMap<any>();
    //
    map.set(MapTypeNode, true);
    map.set('id', node.id);
    map.set('parent', node.parent);

    // 锁定状态
    map.set('locked', node.locked);

    const children = new YMap<never>(node.children.map(c => [c, 1]));
    map.set('children', children);

    const properties = new YMap<any>(toPairs(node.properties));
    properties.set(MapTypeProperties, true);
    map.set('properties', properties);

    return new NodeYMap(map);
  }

  static fromYMap(map?: YMap<any>): NodeYMap | undefined {
    return map && new NodeYMap(map);
  }

  private constructor(private map: YMap<any>) {}

  get id() {
    return this.map.get('id');
  }

  get parent() {
    return this.map.get('parent');
  }

  set parent(value: string | undefined) {
    this.map.set('parent', value);
  }

  get children(): YMap<never> {
    return this.map.get('children');
  }

  get properties(): YMap<any> {
    return this.map.get('properties');
  }

  get locked(): boolean | undefined {
    return this.map.get('locked');
  }

  set locked(value: boolean | undefined) {
    this.map.set('locked', value);
  }

  addChild(child: string) {
    if (!this.children.has(child)) {
      this.children.set(child, 1 as never);
    }
  }

  removeChild(child: string) {
    if (this.children.has(child)) {
      this.children.delete(child);
    }
  }

  updateProperty(key: string, value: any) {
    this.properties.set(key, cloneDeep(value));
  }

  deleteProperty(key: string) {
    this.properties.delete(key);
  }

  toYMap() {
    return this.map;
  }

  toNodePO(): NodePO {
    return {
      id: this.id,
      parent: this.parent,
      locked: this.locked,
      children: Array.from(this.children.keys()),
      properties: fromPairs(Array.from(this.properties.entries())) as BaseNodeProperties,
    };
  }
}

/**
 * 创建根节点，需要和 NodeYMap 保持同步
 */
export function createRoot(children: string[] = []) {
  return NodeYMap.fromNodePO({
    id: MapTypeRoot,
    parent: undefined,
    children,
    properties: {
      __node_name__: MapTypeRoot,
      __node_type__: 'node',
    },
  });
}
