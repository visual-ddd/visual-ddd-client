import { autoBindThis, push, pull } from '@/lib/store';
import { Map as YMap, Doc as YDoc, AbstractType, UndoManager } from 'yjs';
import { observable, action } from 'mobx';
import toPairs from 'lodash/toPairs';
import fromPairs from 'lodash/fromPairs';
import toPath from 'lodash/toPath';
import cloneDeep from 'lodash/cloneDeep';

import { BaseEditorStore } from './BaseEditorStore';
import { BaseNode } from './BaseNode';

import { ROOT_ID } from './constants';
import { toNodePO } from './mapper';
import { BaseNodeProperties, NodePO } from './types';
import { BaseEditorEvent } from './BaseEditorEvent';
import { BaseEditorIndex } from './BaseEditorIndex';

const MapTypeNode = '__NODE__';
const MapTypeRoot = ROOT_ID;
const MapTypeProperties = '__PROPERTY__';

/**
 * 封装对 Node 类型 YMap 的操作
 */
class NodeYMap {
  static fromNodePO(node: NodePO) {
    const map = new YMap<any>();
    //
    map.set(MapTypeNode, true);
    map.set('id', node.id);
    map.set('parent', node.parent);

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
    this.properties.set(key, cloneDeep(value));
  }

  toYMap() {
    return this.map;
  }

  toNodePO(): NodePO {
    return {
      id: this.id,
      parent: this.parent,
      children: Array.from(this.children.keys()),
      properties: fromPairs(Array.from(this.properties.entries())) as BaseNodeProperties,
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
  @observable
  canRedo: boolean = false;

  @observable
  canUndo: boolean = false;

  private doc: YDoc;
  private datasource: YMap<YMap<any>>;
  private store: BaseEditorStore;
  private event: BaseEditorEvent;
  private index: BaseEditorIndex;

  private undoManager: UndoManager;
  private updateQueue: Function[] = [];
  private updatePending: boolean = false;

  constructor(inject: {
    store: BaseEditorStore;
    index: BaseEditorIndex;
    event: BaseEditorEvent;
    datasource: YMap<YMap<any>>;
    doc: YDoc;
  }) {
    const { store, doc, datasource, event, index } = inject;
    this.event = event;
    this.doc = doc;
    this.datasource = datasource;
    this.store = store;
    this.index = index;
    this.undoManager = new UndoManager(datasource, {
      captureTimeout: 0,
    });

    autoBindThis(this);

    this.initialDataSource();
    this.watchStore();
    this.watchDatasource();
    this.watchUndoManager();

    this.undoManager.clear();
  }

  /**
   * 重做
   */
  redo() {
    this.undoManager.redo();
  }

  /**
   * 撤销
   */
  undo() {
    this.undoManager.undo();
  }

  /**
   * 添加节点
   * @param params
   */
  @push('ADD_NODE')
  protected addNode(params: { node: BaseNode }) {
    const po = toNodePO(params.node);
    this.doUpdate(() => {
      this.datasource.set(po.id, NodeYMap.fromNodePO(po).toYMap());
    });
  }

  @push('REMOVE_NODE')
  protected removeNode(params: { node: BaseNode }) {
    this.doUpdate(() => {
      this.datasource.delete(params.node.id);
    });
  }

  @push('ADD_CHILD')
  protected addChild(params: { parent: BaseNode; child: BaseNode }) {
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

  @push('REMOVE_CHILD')
  protected removeChild(params: { parent: BaseNode; child: BaseNode }) {
    this.doUpdate(() => {
      const { parent, child } = params;
      const parentValue = NodeYMap.fromYMap(this.datasource.get(parent.id));
      if (parentValue == null) {
        return;
      }

      parentValue.removeChild(child.id);
    });
  }

  @push('UPDATE_NODE_PROPERTY')
  protected updateNodeProperty(params: { node: BaseNode; path: string; value: any }) {
    this.doUpdate(() => {
      const { node, path, value } = params;
      const paths = toPath(path);
      const nodeMap = NodeYMap.fromYMap(this.datasource.get(node.id));
      if (nodeMap != null) {
        nodeMap.updateProperty(paths[0], value);
      }
    });
  }

  @pull('ADD_NODE')
  protected handleAddNode(params: { node: NodePO }) {
    const { node } = params;
    this.store.createNode({
      id: node.id,
      name: node.properties.__node_name__,
      type: node.properties.__node_type__,
      properties: node.properties,
    });
  }

  @pull('DELETE_NODE')
  protected handleRemoveNode(params: { nodeId: string }) {
    const { nodeId } = params;
    const model = this.index.getNodeById(nodeId);
    if (model) {
      this.store.removeNode({ node: model });
    }
  }

  @pull('ADD_CHILD')
  protected handleAddChild(param: { parent: NodePO; childId: string }) {
    const { parent, childId } = param;
    const parentModel = this.index.getNodeById(parent.id);
    const childModel = this.index.getNodeById(childId);

    if (parentModel == null || childModel == null) {
      return;
    }

    this.store.appendChild({ child: childModel, parent: parentModel });
  }

  @pull('REMOVE_CHILD')
  protected handleRemoveChild(param: { parent: NodePO; childId: string }) {
    const { parent, childId } = param;
    const parentModel = this.index.getNodeById(parent.id);
    const childModel = this.index.getNodeById(childId);

    if (parentModel == null || childModel == null) {
      return;
    }

    this.store.removeChild({ child: childModel, parent: parentModel });
  }

  @pull('UPDATE_NODE_PROPERTY')
  protected handleUpdateNodeProperty(param: { node: NodePO; path: string }) {
    const { node, path } = param;
    const model = this.index.getNodeById(node.id);
    if (model) {
      this.store.updateNodeProperty({ node: model, path: path, value: node.properties[path] });
    }
  }

  private initialDataSource() {
    const root = toNodePO(this.store.root);
    this.datasource.set(root.id, NodeYMap.fromNodePO(root).toYMap());
  }

  /**
   * 监听来自 Store 的事件
   */
  private watchStore() {
    this.event.on('NODE_CREATED', this.addNode);
    this.event.on('NODE_REMOVED', this.removeNode);
    this.event.on('NODE_APPEND_CHILD', this.addChild);
    this.event.on('NODE_REMOVE_CHILD', this.removeChild);
    this.event.on('NODE_UPDATE_PROPERTY', this.updateNodeProperty);
  }

  private watchUndoManager() {
    const stackChange = action('UPDATE_UNDO_STATE', () => {
      this.canRedo = this.undoManager.canRedo();
      this.canUndo = this.undoManager.canUndo();
    });

    this.undoManager.on('stack-item-added', stackChange);
    this.undoManager.on('stack-item-popped', stackChange);
  }

  /**
   * 监听yjs 数据源的事件
   */
  private async watchDatasource() {
    console.log('isLoaded', this.doc.isLoaded);
    this.datasource.observeDeep((evts, transact) => {
      console.log('datasource change', evts);
      // 本地触发, 并且不是 UndoManager 触发的, 跳过
      if (transact.local && transact.origin !== this.undoManager) {
        return;
      }

      for (const evt of evts) {
        const { target } = evt;
        if (this.isRootMap(target)) {
          // 只有增删两种操作
          for (const [key, action] of evt.keys) {
            switch (action.action) {
              case 'add': {
                const node = NodeYMap.fromYMap(target.get(key))!.toNodePO();

                this.handleAddNode({ node });

                // 已经包含了 parent, 因为是原子操作，parent 变更可能不会触发额外的事件
                if (node.parent) {
                  const parent = NodeYMap.fromYMap(target.get(node.parent))?.toNodePO()!;
                  this.handleAddChild({ parent: parent, childId: node.id });
                }
                break;
              }
              case 'delete':
                this.handleRemoveNode({ nodeId: key });
                break;
            }
          }
        } else if (this.isNodeMap(target)) {
          // 节点内容变动，这里只可能是 parent 变动，这里不做处理，在children 那里处理
        } else if (this.isPropertiesMap(target)) {
          const nodePO = NodeYMap.fromYMap(target.parent as YMap<any>)!.toNodePO();
          // 属性变动
          for (const [key, action] of evt.keys) {
            if (action.action === 'update') {
              this.handleUpdateNodeProperty({ node: nodePO, path: key });
            }
          }
        } else if (this.isYMap(target)) {
          // children 变动
          // 只有增删两种操作
          const parentPO = NodeYMap.fromYMap(target.parent as YMap<any>)!.toNodePO();
          for (const [key, action] of evt.keys) {
            switch (action.action) {
              case 'add':
                this.handleAddChild({
                  parent: parentPO,
                  childId: key,
                });
                break;
              case 'delete':
                this.handleRemoveChild({
                  parent: parentPO,
                  childId: key,
                });
                break;
            }
          }
        }
      }
    });
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
      });
    });
  }

  private isYMap(doc: AbstractType<any>): doc is YMap<any> {
    return doc instanceof YMap<any>;
  }

  private isRootMap(doc: AbstractType<any>): doc is YMap<any> {
    return this.isYMap(doc) && doc.has(MapTypeRoot);
  }

  private isNodeMap(doc: AbstractType<any>): doc is YMap<any> {
    return this.isYMap(doc) && doc.has(MapTypeNode);
  }

  private isPropertiesMap(doc: AbstractType<any>): doc is YMap<any> {
    return this.isYMap(doc) && doc.has(MapTypeProperties);
  }
}