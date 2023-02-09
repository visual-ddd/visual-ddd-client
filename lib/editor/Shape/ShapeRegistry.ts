import { Cell, Graph, Node, Shape } from '@antv/x6';
import { Options } from '@antv/x6/lib/graph/options';
import { Transform } from '@antv/x6-plugin-transform';
import { NoopObject } from '@wakeapp/utils';

import { CopyPayload } from '../Canvas/ClipboardUtils';
import type { BaseEditorModel, BaseNode, BaseNodeProperties, Properties } from '../Model';

import { shapes } from './store';
import { DEFAULT_AUTO_RESIZE_GROUP_PADDING } from './constants';
import { NormalizedAutoResizeGroup } from './types';

export class ShapeRegistry {
  private editorModel: BaseEditorModel;

  private _graph?: Graph;
  private get graph() {
    if (this._graph == null) {
      throw new Error('需要调用 bindGraph 绑定 graph');
    }
    return this._graph;
  }

  constructor(inject: { editorModel: BaseEditorModel }) {
    this.editorModel = inject.editorModel;
  }

  bindGraph = (graph: Graph) => {
    this.bindGraphIfNeed(graph);
  };

  createEdge = (context: { graph: Graph; cell: Cell; magnet: Element }) => {
    const { graph, cell, magnet } = context;
    this.bindGraphIfNeed(graph);

    const model = this.getModelByCell(cell);
    if (model) {
      const configuration = this.getConfigurationByModel(model);
      if (configuration?.edgeFactory) {
        const type =
          typeof configuration.edgeFactory === 'function'
            ? configuration.edgeFactory({ cell, graph, model, magnet })
            : configuration.edgeFactory;

        const edgeConfiguration = this.getConfigurationByName(type);

        if (edgeConfiguration == null) {
          throw new Error(`未找到类型为 ${type} 的图形组件`);
        }

        const initialStaticProperties = edgeConfiguration.staticProps?.();

        // 注入类型信息，方便恢复
        const typeInfo: BaseNodeProperties = {
          __node_type__: edgeConfiguration.shapeType,
          __node_name__: type,
        };

        return graph.createEdge({
          ...initialStaticProperties,
          data: {
            ...initialStaticProperties?.data,
            ...typeInfo,
          },
        });
      }
    }

    return new Shape.Edge();
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
   * 获取图形组件的类型
   * @param type
   * @returns
   */
  getShapeType(type: string) {
    const conf = this.getConfigurationByName(type);
    return conf?.shapeType;
  }

  /**
   * 是否为自动分组
   * @param context
   * @returns
   */
  isAutoResizeGroup = (context: { graph: Graph; node: Node }): boolean => {
    const conf = this.getAutoResizeGroupConfig(context);

    return !!conf;
  };

  /**
   * 判断是否支持节点连接，这个需要挂载到 allowLoop 验证器上，因为 allowNode 并不可靠
   * @param context
   * @returns
   */
  isAllowNodeConnect = (context: Options.ValidateConnectionArgs) => {
    const { sourceCell, sourcePort, targetCell, targetPort } = context;

    // 源头修改
    if (sourceCell?.isEdge()) {
      return true;
    }

    const sourceModel = this.getModelByCell(sourceCell!)!;
    const targetModel = this.getModelByCell(targetCell!)!;

    const configuration = this.getConfigurationByModel(sourceModel)!;

    // 循环判断
    const isLoop = sourceCell === targetCell;
    if (isLoop) {
      return configuration.allowLoopConnect ?? true;
    }

    // 节点判断
    if (targetCell?.isNode()) {
      const validate = configuration.allowConnectNodes;

      if (Array.isArray(validate)) {
        return validate.includes(targetModel.name);
      } else if (typeof validate === 'function') {
        return validate({
          sourceCell: sourceCell!,
          sourcePort: sourcePort!,
          sourceModel,
          targetCell: targetCell!,
          targetModel,
          targetPort: targetPort!,
          graph: this.graph,
        });
      }
      return validate ?? true;
    }

    return true;
  };

  /**
   * 是否支持旋转
   */
  isRotatable = (context: { graph: Graph; node: Node }): Transform.RotatingRaw | boolean => {
    const { graph, node } = context;
    this.bindGraphIfNeed(graph);

    const conf = this.getConfigurationByCell(node);

    if (conf == null) {
      return false;
    }

    const rotating = conf.rotating;

    if (typeof rotating === 'number') {
      return { enabled: true, grid: rotating };
    }

    return rotating ?? false;
  };

  /**
   * 是否支持尺寸调整
   * TODO: 缓存计算结果
   */
  isResizable = (context: { graph: Graph; node: Node }): Transform.ResizingRaw | boolean => {
    const { graph, node } = context;
    this.bindGraphIfNeed(graph);

    const conf = this.getConfigurationByCell(node);

    if (conf == null) {
      return false;
    }

    const resizing = conf.resizing;

    if (!resizing) {
      return false;
    }

    if (typeof resizing === 'object') {
      return { enabled: true, ...resizing };
    }

    if (typeof resizing === 'function') {
      const result = resizing({ node, graph });
      return { enabled: true, ...result };
    }

    return resizing ?? false;
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

    const model = this.getModelByCell(cell);

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
    const model = this.getModelByCell(context.parent)!;
    const childModel = this.getModelByCell(context.child)!;

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
    const model = this.getModelByCell(parent)!;
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
    const conf = this.getConfigurationByName(type);

    if (conf == null) {
      throw new Error(`未找到 ${type} 类型的组件`);
    }

    const position = this.graph.pageToLocal(nativeEvent.pageX, nativeEvent.pageY);
    const properties: Properties = {
      // TODO: 需要根据节点的类型，比如只有 node 才有 position，edge 则是 source 和 target
      // 这里的数据尽量保存纯对象
      position: { x: position.x, y: position.y },
      ...conf?.initialProps?.(),
      ...conf?.dropFactory?.({ graph: this.graph, nativeEvent }),
    };

    // TODO: 抽象生命周期
    if ((conf.group && conf.autoResizeGroup) || typeof conf.autoResizeGroup === 'number') {
      const staticProps = conf.staticProps?.();
      // 添加 originSize, size 是必填的，否则组件无法正常渲染
      const size = properties.size ?? staticProps?.size ?? { width: 100, height: 100 };
      properties.originSize = size;
    }

    return {
      type,
      shapeType: conf.shapeType,
      properties,
    };
  }

  copyFactory(context: { payload: CopyPayload }) {
    const { payload } = context;
    const type = this.getTypeFromBaseNodeProperties(payload.properties);
    const configuration = this.getConfigurationByName(type);

    if (configuration == null) {
      throw new Error(`未找到 ${type} 类型的组件`);
    }

    return {
      type,
      shapeType: configuration.shapeType,
      properties: {
        ...configuration.initialProps?.(),
        ...payload.properties,
        ...(configuration?.copyFactory?.({ properties: payload.properties, payload }) ?? NoopObject),
      },
    };
  }

  getModelByCell(node: { id: string }) {
    return this.editorModel.index.getNodeById(node.id);
  }

  getConfigurationByCell(cell: Cell) {
    const model = this.getModelByCell(cell);

    if (model) {
      return this.getConfigurationByModel(model);
    }
  }

  getConfigurationByModel(model: BaseNode) {
    return shapes.get(model.name);
  }

  getConfigurationByName(name: string) {
    return shapes.get(name);
  }

  getAutoResizeGroupConfig(context: { graph: Graph; node: Node }): NormalizedAutoResizeGroup | false {
    const { graph, node } = context;
    this.bindGraphIfNeed(graph);

    const conf = this.getConfigurationByCell(node);

    if (!conf?.group) {
      return false;
    }

    if (conf.autoResizeGroup) {
      if (typeof conf.autoResizeGroup === 'boolean') {
        return { padding: DEFAULT_AUTO_RESIZE_GROUP_PADDING, minHeight: 0, minWidth: 0 };
      } else if (typeof conf.autoResizeGroup === 'number') {
        return { padding: conf.autoResizeGroup, minHeight: 0, minWidth: 0 };
      } else {
        return {
          padding: conf.autoResizeGroup.padding ?? DEFAULT_AUTO_RESIZE_GROUP_PADDING,
          minWidth: conf.autoResizeGroup.minWidth ?? 0,
          minHeight: conf.autoResizeGroup.minHeight ?? 0,
        };
      }
    }

    return false;
  }

  private bindGraphIfNeed(graph: Graph) {
    if (this._graph == null || this._graph !== graph) {
      this._graph = graph;
    }
  }

  private getTypeFromBaseNodeProperties(properties: BaseNodeProperties) {
    return properties.__node_name__;
  }
}
