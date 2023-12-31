import { makeAutoBindThis, push, pull, mutation } from '@/lib/store';
import { Map as YMap, Doc as YDoc, YEvent, Transaction, AbstractType, UndoManager } from 'yjs';
import { observable, makeObservable } from 'mobx';
import { getPaths, IDisposable } from '@/lib/utils';
import { Disposer } from '@wakeapp/utils';
import { isReverseOrigin } from '@/lib/yjs-reverse';

import { BaseEditorStore } from './BaseEditorStore';
import { BaseNode } from './BaseNode';

import { toNodePO } from './mapper';
import { NodePO } from './types';
import { NodeYMap, MapTypeNode, MapTypeRoot, MapTypeProperties } from './Yjs/NodeYMap';
import { BaseEditorEvent } from './BaseEditorEvent';
import { BaseEditorIndex } from './BaseEditorIndex';
import { sync } from './Yjs/sync';

/**
 * yjs 数据库
 */
export class BaseEditorDatasource implements IDisposable {
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

  private postPullQueue: Map<`${'REMOVE_CHILD' | 'ADD_CHILD'}:${string},${string}`, Function> = new Map();

  private disposer = new Disposer();

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
      // captureTimeout: 0, 默认 500ms
    });
    this.disposer.push(() => {
      this.undoManager.destroy();
    });

    makeAutoBindThis(this);
    makeObservable(this);

    this.watchStore();
    this.watchDatasource();
    this.watchUndoManager();

    this.undoManager.clear();
  }

  dispose() {
    this.disposer.release();
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
   * 重置上一次入栈的时间，这也意味着，在接下来的 captureTimeout 时间内，发生的时间会合并到上一个
   */
  mergeCapturing() {
    this.undoManager.lastChange = Date.now();
  }

  /**
   * 强制另起一个栈
   */
  stopCapturing() {
    this.undoManager.stopCapturing();
  }

  /**
   * 清空 undo 栈
   */
  clearUndoStack() {
    this.undoManager.clear();
    this.undoStackChange();
  }

  /**
   * 强制保持一致性
   */
  forceSync(): Promise<void> {
    const dangleNodes = this.index.getDangleNodes();
    const tasks: Function[] = [];

    // gc 删除悬挂节点
    if (dangleNodes.length) {
      for (const n of dangleNodes) {
        tasks.push(() => {
          console.warn(`正在删除悬挂节点`, n);
          this.removeNode({ node: n });
          this.handleRemoveNode({ nodeId: n.id });
        });
      }
    }

    // 同步节点信息
    const nodes = this.index.getNodes();
    for (const n of nodes) {
      const map = this.datasource.get(n.id);
      if (map == null) {
        // 不存在，创建
        tasks.push(() => {
          this.addNode({ node: n });
        });
      } else {
        const subTasks = sync(n, NodeYMap.fromYMap(map)!);
        if (subTasks.length) {
          tasks.push(...subTasks);
        }
      }
    }

    if (tasks.length) {
      console.debug(`正在同步节点差异`);
      const promise = new Promise<void>(resolve => {
        tasks.push(() => {
          this.doUpdate(resolve);
        });
      });

      // 执行任务
      tasks.forEach(i => i());

      return promise.then(() => {
        // 合并 undo 栈
        this.mergeCapturing();
      });
    }

    return Promise.resolve();
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
      let parentValue = NodeYMap.fromYMap(this.datasource.get(parent.id));
      const childValue = NodeYMap.fromYMap(this.datasource.get(child.id));

      if (parentValue == null) {
        if (parent.id === this.store.root.id) {
          // 服务端会初始化模板，通常不会到这一步
          // 按需初始化根节点
          parentValue = this.createRoot();
        } else {
          console.warn('BaseEditorDatasource.addChild: parent is null');
          return;
        }
      }

      if (childValue == null) {
        console.warn('BaseEditorDatasource.addChild: child is null');
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
        console.warn('BaseEditorDatasource.removeChild: parent is null');
        return;
      }

      parentValue.removeChild(child.id);

      const childValue = NodeYMap.fromYMap(this.datasource.get(child.id));
      if (childValue == null) {
        console.warn('BaseEditorDatasource.removeChild: child is null');
        return;
      }

      if (childValue.parent === parentValue.id) {
        childValue.parent = undefined;
      }
    });
  }

  @push('UPDATE_NODE_PROPERTY')
  protected updateNodeProperty(params: { node: BaseNode; path: string; value: any }) {
    this.doUpdate(() => {
      const { node, path } = params;
      const paths = getPaths(path);
      const nodeMap = NodeYMap.fromYMap(this.datasource.get(node.id));

      if (nodeMap != null) {
        const field = paths[0];
        nodeMap.updateProperty(field, node.getProperty(field));
      }
    });
  }

  @push('DELETE_NODE_PROPERTY')
  protected deleteNodeProperty(params: { node: BaseNode; path: string }) {
    this.doUpdate(() => {
      const { node, path } = params;
      const paths = getPaths(path);
      const isRoot = path.length === 1;

      const nodeMap = NodeYMap.fromYMap(this.datasource.get(node.id));

      if (nodeMap != null) {
        const field = paths[0];
        if (isRoot) {
          nodeMap.deleteProperty(field);
        } else {
          nodeMap.updateProperty(field, node.getProperty(field));
        }
      }
    });
  }

  @push('NODE_LOCKED')
  protected lockNode(params: { node: BaseNode }) {
    this.doUpdate(() => {
      const { node } = params;

      const nodeMap = NodeYMap.fromYMap(this.datasource.get(node.id));
      if (nodeMap) {
        nodeMap.locked = true;
      }
    });
  }

  @push('NODE_UNLOCKED')
  protected unlockNode(params: { node: BaseNode }) {
    this.doUpdate(() => {
      const { node } = params;

      const nodeMap = NodeYMap.fromYMap(this.datasource.get(node.id));
      if (nodeMap) {
        nodeMap.locked = false;
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
      locked: node.locked,
    });
  }

  @pull('DELETE_NODE')
  protected handleRemoveNode(params: { nodeId: string }) {
    const { nodeId } = params;

    const model = this.index.getNodeById(nodeId);
    if (model) {
      this.store.removeNode({ node: model });
    }

    return model;
  }

  @pull('ADD_CHILD')
  protected handleAddChild(param: { parentId: string; childId: string }) {
    const { parentId, childId } = param;
    const parentModel = this.index.getNodeById(parentId);
    const childModel = this.index.getNodeById(childId);

    if (parentModel == null || childModel == null) {
      console.warn(
        `BaseEditorDatasource addChild parentModel or childModel is null, 出现悬挂节点`,
        parentId,
        parentModel,
        childModel
      );
      return;
    }

    this.store.appendChild({ child: childModel, parent: parentModel });
  }

  @pull('REMOVE_CHILD')
  protected handleRemoveChild(param: { parentId: string; childId: string }) {
    const { parentId, childId } = param;
    const parentModel = this.index.getNodeById(parentId);
    const childModel = this.index.getNodeById(childId);

    if (parentModel == null || childModel == null) {
      console.warn(`removeChild parentModel or childModel is null, 出现悬挂节点`, parentId, parentModel, childModel);

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

  @pull('DELETE_NODE_PROPERTY')
  protected handleDeleteNodeProperty(param: { node: NodePO; path: string }) {
    const { node, path } = param;
    const model = this.index.getNodeById(node.id);
    if (model) {
      this.store.deleteNodeProperty({ node: model, path: path });
    }
  }

  @pull('LOCK_NODE')
  protected handleLockNode(param: { node: NodePO }) {
    const { node } = param;
    const model = this.index.getNodeById(node.id);
    if (model) {
      this.store.lock({ node: model });
    }
  }

  @pull('UNLOCK_NODE')
  protected handleUnlockNode(param: { node: NodePO }) {
    const { node } = param;
    const model = this.index.getNodeById(node.id);
    if (model) {
      this.store.unlock({ node: model });
    }
  }
  /**
   * 创建根节点
   * @returns
   */
  private createRoot() {
    const rootId = this.store.root.id;
    const root = toNodePO(this.store.root);
    const wrapper = NodeYMap.fromNodePO(root);
    this.datasource.set(rootId, wrapper.toYMap());

    return wrapper;
  }

  /**
   * 监听来自 Store 的事件
   */
  private watchStore() {
    this.disposer.push(
      this.event.on('NODE_CREATED', this.addNode),
      this.event.on('NODE_REMOVED', this.removeNode),
      this.event.on('NODE_APPEND_CHILD', this.addChild),
      this.event.on('NODE_REMOVE_CHILD', this.removeChild),
      this.event.on('NODE_UPDATE_PROPERTY', this.updateNodeProperty),
      this.event.on('NODE_DELETE_PROPERTY', this.deleteNodeProperty),
      this.event.on('NODE_LOCKED', this.lockNode),
      this.event.on('NODE_UNLOCKED', this.unlockNode)
    );
  }

  private watchUndoManager() {
    this.undoManager.on('stack-item-added', this.undoStackChange);
    this.undoManager.on('stack-item-popped', this.undoStackChange);
  }

  /**
   * 监听yjs 数据源的事件
   */
  private async watchDatasource() {
    console.log('isLoaded', this.doc.isLoaded);

    // 初始化
    if (this.datasource.size) {
      // 这里延迟触发，因为其他地方可能依赖这里的事件
      Promise.resolve().then(() => {
        this.initialDatasource();
      });
    }

    // 监听
    const listener = (evts: YEvent<any>[], transact: Transaction) => {
      console.log('datasource change', evts);
      // 本地触发, 并且不是 UndoManager 和 reverse 操作触发的, 跳过
      if (transact.local && transact.origin !== this.undoManager && !isReverseOrigin(transact.origin)) {
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
                  this.postPullQueue.set(`ADD_CHILD:${node.parent},${node.id}`, () => {
                    this.handleAddChild({ parentId: node.parent!, childId: node.id });
                  });
                }

                // 处理子节点
                if (node.children) {
                  for (const childId of node.children) {
                    this.postPullQueue.set(`ADD_CHILD:${node.id},${childId}`, () => {
                      this.handleAddChild({ parentId: node.id, childId });
                    });
                  }
                }
                break;
              }
              case 'delete': {
                const node = this.handleRemoveNode({ nodeId: key });

                // removeChild 有一定几率会收不到，这里进行删除，只要确保 removeChild 幂等就行
                if (node?.parent) {
                  this.postPullQueue.set(`REMOVE_CHILD:${node.parent!.id},${key}`, () => {
                    this.handleRemoveChild({ parentId: node.parent!.id, childId: key });
                  });
                }

                break;
              }
            }
          }
        } else if (this.isNodeMap(target)) {
          const nodeYMap = NodeYMap.fromYMap(target);
          if (nodeYMap == null) {
            console.warn(`nodeYMap is null`);
            continue;
          }

          // 节点内容变动，这里只可能是 parent 变动，这里也做处理，在 children 那里也会处理, 需要进行去重
          // 某些比较极端的场景 children 变更可能不会触发
          for (const [key] of evt.keys) {
            switch (key) {
              case 'parent': {
                if (nodeYMap.parent) {
                  this.postPullQueue.set(`ADD_CHILD:${nodeYMap.parent},${nodeYMap.id}`, () => {
                    this.handleAddChild({
                      parentId: nodeYMap.parent!,
                      childId: nodeYMap.id,
                    });
                  });
                }
                break;
              }
              case 'locked': {
                if (nodeYMap.locked) {
                  this.handleLockNode({ node: nodeYMap.toNodePO() });
                } else {
                  this.handleUnlockNode({ node: nodeYMap.toNodePO() });
                }

                break;
              }
            }
          }
        } else if (this.isPropertiesMap(target)) {
          // 属性变动
          const nodePO = NodeYMap.fromYMap(target.parent as YMap<any>)!.toNodePO();

          for (const [key, action] of evt.keys) {
            if (action.action === 'delete') {
              this.handleDeleteNodeProperty({ node: nodePO, path: key });
            } else {
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
                this.postPullQueue.set(`ADD_CHILD:${parentPO.id},${key}`, () => {
                  this.handleAddChild({
                    parentId: parentPO.id,
                    childId: key,
                  });
                });
                break;
              case 'delete':
                this.postPullQueue.set(`REMOVE_CHILD:${parentPO.id},${key}`, () => {
                  this.handleRemoveChild({
                    parentId: parentPO.id,
                    childId: key,
                  });
                });
                break;
            }
          }
        }
      }

      // 后更新，这里主要是等待所有任务处理完成，比如可以更靠谱地获取到父节点
      const postPullQueue = this.postPullQueue;
      if (postPullQueue.size) {
        this.postPullQueue = new Map();

        // 先删除后添加
        const appendActions: Function[] = [];
        for (const [key, action] of postPullQueue) {
          if (key.startsWith('ADD_CHILD')) {
            appendActions.push(action);
          } else {
            action();
          }
        }

        if (appendActions.length) {
          for (const i of appendActions) {
            i();
          }
        }
      }

      console.log('datasource change end');
    };

    this.datasource.observeDeep(listener);
    this.disposer.push(() => {
      this.datasource.unobserveDeep(listener);
    });
  }

  private initialDatasource() {
    // 父子节点关系
    const relationships: Record<string, Set<string>> = {};

    const addRelationship = (parentId: string, childId: string) => {
      if (relationships[parentId]) {
        relationships[parentId].add(childId);
      } else {
        relationships[parentId] = new Set([childId]);
      }
    };

    this.datasource.forEach((map, nodeId) => {
      const node = NodeYMap.fromYMap(map)!.toNodePO();
      this.handleAddNode({ node });

      if (node.parent) {
        addRelationship(node.parent, node.id);
      }

      if (node.children) {
        for (const childId of node.children) {
          addRelationship(node.id, childId);
        }
      }
    });

    const parentKeys = Object.keys(relationships);

    if (parentKeys.length) {
      for (const parentId of parentKeys) {
        const children = relationships[parentId];
        for (const childId of children) {
          this.handleAddChild({ parentId, childId });
        }
      }
    }
  }

  @mutation('UNDO_STACK_CHANGE', false)
  private undoStackChange() {
    this.canRedo = this.undoManager.canRedo();
    this.canUndo = this.undoManager.canUndo();
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
