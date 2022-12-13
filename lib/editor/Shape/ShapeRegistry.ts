import { Cell, Graph, Node } from '@antv/x6';
import { Options } from '@antv/x6/lib/graph/options';
import type { BaseEditorStore, BaseNode } from '../Model';

import { shapes } from './store';

export class ShapeRegistry {
  private editorStore: BaseEditorStore;

  private _graph?: Graph;
  private get graph() {
    if (this._graph == null) {
      throw new Error('需要调用 bindGraph 绑定 graph');
    }
    return this._graph;
  }

  constructor(store: BaseEditorStore) {
    this.editorStore = store;
  }

  bindGraph = (graph: Graph) => {
    this.bindGraphIfNeed(graph);
  };

  /**
   * 图形组件是否已经注册
   * @param type
   * @returns
   */
  isShapeDefined(type: string) {
    return shapes.has(type);
  }

  /**
   * 是否支持循环连线, 默认 true
   */
  isAllowLoopConnect = (context: Options.ValidateConnectionArgs) => {
    const cell = context.sourceCell!;
    const model = this.getModelByNode(cell)!;
    const config = this.getConfigurationByModel(model);
    const allow = config?.allowLoopConnect ?? true;

    if (allow) {
      return true;
    }

    // 禁止情况，如果是环就返回 false
    // X6 不会自己判断是否为循环，allowLoop 会被频繁调用
    const isLoop = context.sourceCell === context.targetCell;

    return !isLoop;
  };

  /**
   * 是否支持移除, 默认 true
   * @param context
   * @returns
   */
  isRemovable = (context: { model: BaseNode }) => {
    const conf = this.getConfigurationByModel(context.model);

    if (typeof conf?.removable === 'function') {
      return conf.removable({ graph: this.graph, model: context.model });
    }

    return conf?.removable ?? true;
  };

  /**
   * 是否支持选中
   * @param context
   * @returns
   */
  isSelectable(context: { cell: Cell; graph: Graph }): boolean {
    const { cell, graph } = context;
    this.bindGraphIfNeed(graph);

    // 隐藏节点不能选择
    if (!cell.isVisible()) {
      return false;
    }

    const model = this.getModelByNode(cell);

    // 未定义类型
    if (model == null) {
      return true;
    }

    const conf = this.getConfigurationByModel(model);

    return conf?.selectable ?? true;
  }

  /**
   * 是否支持节点内嵌
   * @param context
   * @returns
   */
  isEmbeddable(context: { parent: Node; child: Node; graph: Graph }): boolean {
    this.bindGraphIfNeed(context.graph);
    const model = this.getModelByNode(context.parent)!;
    const childModel = this.getModelByNode(context.child)!;

    const conf = this.getConfigurationByModel(model)!;

    if (!conf.group) {
      return false;
    }

    if (typeof conf.embeddable === 'function') {
      return conf.embeddable({ model, childModel, node: context.parent, child: context.child, graph: this.graph });
    }

    return conf.embeddable ?? true;
  }

  /**
   * 是否支持组件库投入
   * @param context
   */
  isDroppable(context: { parent: Node; sourceType: string; graph: Graph }): boolean {
    const { graph, parent, sourceType } = context;
    this.bindGraphIfNeed(graph);
    const model = this.getModelByNode(parent)!;
    const conf = this.getConfigurationByModel(model)!;

    if (!conf.group) {
      return false;
    }

    if (typeof conf.droppable === 'function') {
      return conf.droppable({ graph: this.graph, model, node: parent, sourceType });
    }

    return conf.droppable ?? true;
  }

  dropFactory(context: { type: string; nativeEvent: React.DragEvent; graph: Graph }) {
    const { graph, type, nativeEvent } = context;
    this.bindGraphIfNeed(graph);
    const position = this.graph.pageToLocal(nativeEvent.pageX, nativeEvent.pageY);
    const conf = this.getConfigurationByName(type);

    return {
      position,
      ...conf?.dropFactory?.({ graph: this.graph, nativeEvent }),
    };
  }

  getModelByNode(node: { id: string }) {
    return this.editorStore.getNodeById(node.id);
  }

  private getConfigurationByModel(model: BaseNode) {
    return shapes.get(model.type);
  }

  private getConfigurationByName(name: string) {
    return shapes.get(name);
  }

  private bindGraphIfNeed(graph: Graph) {
    if (this._graph == null) {
      this._graph = graph;
    }
  }
}
