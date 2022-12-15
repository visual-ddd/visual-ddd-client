import { autoBindThis, update } from '@/lib/store';
import { Map as YMap, Doc as YDoc } from 'yjs';
import toPairs from 'lodash/toPairs';
import fromPairs from 'lodash/fromPairs';

import { BaseEditorStore } from './BaseEditorStore';
import { BaseNode } from './BaseNode';

// @ts-ignore
import { ROOT_ID, TRANSACT_ORIGIN } from './constants';
import { toNodePO } from './mapper';
import { NodePO } from './types';
import { BaseEditorEvent } from './BaseEditorEvent';

/**
 * 封装对 Node 类型 YMap 的操作
 */
class NodeYMap {
  static fromNodePO(node: NodePO) {
    const map = new YMap<any>();
    map.set('id', node.id);
    map.set('parent', node.parent);

    const children = new YMap<never>(node.children.map(c => [c, 1]));
    map.set('children', children);

    const properties = new YMap<any>(toPairs(node.properties));
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

  set parent(value: string) {
    this.map.set('parent', value);
  }

  get children(): YMap<never> {
    return this.map.get('children');
  }

  get properties(): YMap<any> {
    return this.map.get('properties');
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
    this.properties.set(key, value);
  }

  toYMap() {
    return this.map;
  }

  toNodePO(): NodePO {
    return {
      id: this.id,
      parent: this.parent,
      children: Array.from(this.children.keys()),
      properties: fromPairs(Array.from(this.properties.values())),
    };
  }
}

/**
 * yjs 数据库
 * TODO: 初始化
 * TODO: 避免循环
 * TODO: 离线编辑
 */
export class BaseEditorDatasource {
  private doc: YDoc;
  private datasource: YMap<YMap<any>>;
  private store: BaseEditorStore;
  // @ts-ignore
  private event: BaseEditorEvent;

  private updateQueue: Function[] = [];
  private updatePending: boolean = false;

  constructor(inject: { store: BaseEditorStore; event: BaseEditorEvent; datasource: YMap<YMap<any>>; doc: YDoc }) {
    const { store, doc, datasource, event } = inject;
    this.event = event;
    this.doc = doc;
    this.datasource = datasource;
    this.store = store;

    autoBindThis(this);

    this.initialDataSource();
    this.watchDatasource();
  }

  /**
   * 添加节点
   * @param params
   */
  @update('ADD_NODE')
  addNode(params: { node: BaseNode }) {
    const po = toNodePO(params.node);
    this.doUpdate(() => {
      this.datasource.set(po.id, NodeYMap.fromNodePO(po).toYMap());
    });
  }

  @update('REMOVE_NODE')
  removeNode(params: { node: BaseNode }) {
    this.doUpdate(() => {
      this.datasource.delete(params.node.id);
    });
  }

  @update('ADD_CHILD')
  addChild(params: { parent: BaseNode; child: BaseNode }) {
    this.doUpdate(() => {
      const { parent, child } = params;
      const parentValue = NodeYMap.fromYMap(this.datasource.get(parent.id));
      const childValue = NodeYMap.fromYMap(this.datasource.get(child.id));

      if (parentValue == null || childValue == null) {
        return;
      }

      parentValue.addChild(childValue.id);
      childValue.parent = parentValue.id;
    });
  }

  @update('REMOVE_CHILD')
  removeChild(params: { parent: BaseNode; child: BaseNode }) {
    const { parent, child } = params;
    const parentValue = NodeYMap.fromYMap(this.datasource.get(parent.id));
    if (parentValue == null) {
      return;
    }

    this.doUpdate(() => {
      parentValue.removeChild(child.id);
    });
  }

  /**
   * 重做
   */
  redo() {}

  /**
   * 撤销
   */
  undo() {}

  private initialDataSource() {
    const root = toNodePO(this.store.root);
    this.datasource.set(root.id, NodeYMap.fromNodePO(root).toYMap());
  }

  private async watchDatasource() {
    console.log('isLoaded', this.doc.isLoaded);
    this.datasource.observeDeep((evt, transact) => {
      console.log('datasource change', evt, transact);
    });

    this.doc.load();

    if (!this.doc.isLoaded) {
      await this.doc.whenLoaded;
      console.log('loaded');
    }
  }

  private doUpdate(runner: () => void) {
    this.updateQueue.push(runner);

    if (!this.updatePending) {
      this.updatePending = true;
      this.scheduleUpdate();
    }
  }

  private scheduleUpdate() {
    requestAnimationFrame(() => {
      this.updatePending = false;

      if (!this.updateQueue.length) {
        return;
      }

      const queue = this.updateQueue;
      this.updateQueue = [];

      this.doc.transact(() => {
        // 在事务中处理
        for (const item of queue) {
          item();
        }
      }, TRANSACT_ORIGIN);
    });
  }
}
