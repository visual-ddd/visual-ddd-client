import { Graph, PointLike, Node } from '@antv/x6';
import { Transform } from '@antv/x6-plugin-transform';
import { booleanPredicate, debounce, Disposer } from '@wakeapp/utils';
import { message } from 'antd';

import { wrapPreventListenerOptions } from '@/lib/g6-binding/hooks';
import { GraphBindingOptions, GraphBindingProps } from '@/lib/g6-binding';

import { CanvasEvent } from './CanvasEvent';
import { BaseEditorModel, BaseNodeProperties, BaseNode } from '../Model';
import { ShapeRegistry } from '../Shape';
import { assertShapeInfo } from '../Shape';
import { copy, paste } from './ClipboardUtils';

const ResizingOptionsWithDefault: [keyof Transform.ResizingRaw, any][] = [
  ['minWidth', 0],
  ['minHeight', 0],
  ['maxWidth', Infinity],
  ['maxHeight', Infinity],
  ['orthogonal', true],
  ['restrict', false],
  ['autoScroll', true],
  ['preserveAspectRatio', false],
  ['allowReverse', true],
];

/**
 * 这个模型是无状态的，核心状态保存在 EditorModel
 * 这里主要是为了几种处理画布(View)相关逻辑, 会耦合 UI
 */
export class CanvasModel {
  /**
   * 画布事件
   */
  event: CanvasEvent = new CanvasEvent();

  /**
   * 图形组件管理器
   */
  shapeRegistry: ShapeRegistry;

  /**
   * 编辑器模型
   */
  editorModel: BaseEditorModel;

  get editorIndex() {
    return this.editorModel.index;
  }

  get editorCommandHandler() {
    return this.editorModel.commandHandler;
  }

  get editorStore() {
    return this.editorModel.store;
  }

  get editorViewStore() {
    return this.editorModel.viewStore;
  }

  /**
   * X6 画布对象
   */
  graph?: Graph;

  /**
   * 画布配置
   */
  graphOptions: GraphBindingOptions;

  // 鼠标在画布之内
  graphHovering: boolean = false;

  // 鼠标在画布之类，记录鼠标的位置
  currentMousePagePosition?: PointLike;

  private disposer = new Disposer();

  private resizing = false;

  constructor(inject: { editorModel: BaseEditorModel }) {
    this.editorModel = inject.editorModel;
    const shapeRegistry = (this.shapeRegistry = new ShapeRegistry({ editorModel: inject.editorModel }));

    // 尺寸变换配置
    type Resizing = GraphBindingOptions['resizing'];
    const resizing: Resizing = {
      enabled(node) {
        return !!shapeRegistry.isResizable({ graph: this, node });
      },
    };

    for (const [key, defaultValue] of ResizingOptionsWithDefault) {
      resizing[key] = function (node) {
        const result = shapeRegistry.isResizable({ graph: this, node });

        if (typeof result === 'object') {
          return result[key] ?? defaultValue;
        }

        return defaultValue;
      };
    }

    // 默认配置
    this.graphOptions = {
      background: { color: '#fffbe6' },
      grid: { size: 15, visible: true },

      // 分组嵌入
      // FIXME: X6 目前不支持批量
      embedding: {
        enabled: true,
        findParent: 'bbox',
        // 验证是否支持拖入
        validate(context) {
          return shapeRegistry.isEmbeddable({
            parent: context.parent,
            child: context.child,
            graph: this,
          });
        },
      },

      // 连线控制
      connecting: {
        // 吸附
        snap: true,
        // 高亮所有可以链接的节点和连接桩
        highlight: true,
        // 是否支持循环连线
        allowLoop: arg => {
          return shapeRegistry.isAllowNodeConnect(arg);
        },
        // allowNode 不太靠谱，统一使用 allowLoop 验证
        // allowNode
        createEdge(arg) {
          return shapeRegistry.createEdge({
            graph: this,
            cell: arg.sourceCell,
            magnet: arg.sourceMagnet,
          });
        },
      },

      // 交互行为
      interacting: {
        nodeMovable: true,
        edgeMovable: true,
        edgeLabelMovable: true,
        arrowheadMovable: true,
        magnetConnectable: true,
      },

      // 自动根据容器调整大小
      autoResize: true,

      // 选中处理
      selection: {
        enabled: true,
        multiple: true,

        // 框选
        rubberband: true,
        // 严格框选
        strict: true,

        // 选择框, 选择框可能会阻挡事件?
        showNodeSelectionBox: true,
        showEdgeSelectionBox: true, // edge 选择框是方形
        pointerEvents: 'none', // SelectionBox 会阻挡事件
        filter(cell) {
          return shapeRegistry.isSelectable({ cell, graph: this });
        },
      },

      // 快捷键处理
      keyboard: {
        // 单个页面可能存在多个画布实例
        global: false,
        enabled: true,
      },

      // 剪切板
      clipboard: {
        enabled: true,
        useLocalStorage: false,
      },

      resizing,
      rotating: {
        enabled(node) {
          return !!shapeRegistry.isRotatable({ node, graph: this });
        },
        grid(node) {
          const s = shapeRegistry.isRotatable({ node, graph: this });
          if (typeof s === 'object') {
            return s.grid ?? 15;
          }

          return 15;
        },
      },
    };

    // 监听 EditorModel 事件
    this.disposer.push(
      this.editorModel.event.on('NODE_REMOVED', params => {
        console.log('node removed', params.node);
        this.graph?.unselect(params.node.id);
      })
    );
  }

  /**
   * 资源释放
   */
  dispose = () => {
    this.disposer.release();
  };

  handleMouseMove = (evt: React.MouseEvent) => {
    this.currentMousePagePosition = { x: evt.pageX, y: evt.pageY };
  };

  handleMouseEnter = () => {
    this.graphHovering = true;
  };

  handleMouseLeave = () => {
    this.graphHovering = true;
  };

  handleZIndexChange: GraphBindingProps['onCell$Change$ZIndex'] = evt => {
    const { cell, current } = evt;
    const node = this.shapeRegistry.getModelByCell(cell);

    if (node) {
      this.editorCommandHandler.updateNodeProperty({ node, path: 'zIndex', value: current });
    }
  };

  /**
   * 节点移动结束
   * @param evt
   */
  handleNodeMoved: GraphBindingProps['onNode$Moved'] = evt => {
    const { node } = evt;

    this.resizeParentGroupIfNeeded(node);

    const updatePosition = (node: Node) => {
      const model = this.editorIndex.getNodeById(node.id);
      if (model) {
        this.editorCommandHandler.updateNodeProperty({ node: model, path: 'position', value: node.getPosition() });
      }

      // X6 分组移动时，子节点不会更新
      const children = node.getChildren();
      if (children?.length) {
        for (const child of children) {
          if (child.isNode()) {
            updatePosition(child);
          }
          // TODO: edge 如果是 pointer 类型也需要更新
        }
      }
    };

    updatePosition(node);
  };

  /**
   * 节点旋转结束
   * @param evt
   */
  handleNodeRotated: GraphBindingProps['onNode$Rotated'] = evt => {
    const { node } = evt;

    this.resizeParentGroupIfNeeded(node);

    const model = this.shapeRegistry.getModelByCell(node);
    if (model) {
      this.editorCommandHandler.updateNodeProperty({ node: model, path: 'angle', value: node.getAngle() });
    }
  };

  /**
   * 开始拖拽
   * @param evt
   */
  handleNodeResizeStart: GraphBindingProps['onNode$Resize'] = evt => {
    this.resizing = true;
  };

  /**
   * 节点变更
   * @param evt
   */
  handleNodeSizeChange: GraphBindingProps['onNode$Change$Size'] = evt => {
    if (this.resizing) {
      // 正在拖拽，resize 会频繁触发，这里跳过
      return;
    }

    const { node, options } = evt;

    this.setNodeSize(node, options.isAutoResizeGroup);
  };

  handleNodeResized: GraphBindingProps['onNode$Resized'] = evt => {
    this.resizing = false;
    const { node } = evt;

    this.setNodeSize(node, false);
  };

  /**
   * 选择变动
   */
  handleSelectionChanged: GraphBindingProps['onSelection$Changed'] = evt => {
    if (evt.added.length || evt.removed.length) {
      const selected = evt.selected.map(i => this.shapeRegistry.getModelByCell(i)).filter(booleanPredicate);
      this.editorCommandHandler.setSelected({ selected });
    }
  };

  /**
   * 处理组件库拖入
   * @param evt
   * @returns
   */
  handleDrop: GraphBindingProps['onDrop'] = evt => {
    const { componentData, nativeEvent, graph } = evt;

    if (!assertShapeInfo(componentData)) {
      console.error('拖入内容不包含 type');
      return;
    }

    const { type } = componentData;

    // 构造节点
    const { properties, shapeType } = this.shapeRegistry.dropFactory({ type, nativeEvent, graph });

    // 定位被拖入的父节点
    const localPoint = graph.pageToLocal(nativeEvent.pageX, nativeEvent.pageY);
    const maybeParents = graph.getNodesFromPoint(localPoint).sort((a, b) => {
      return b.getZIndex()! - a.getZIndex()!;
    });

    // 插入操作
    const insert = (parentNode?: Node) => {
      const parent = parentNode && this.editorIndex.getNodeById(parentNode.id);
      this.editorCommandHandler.createNode({
        name: type,
        type: shapeType,
        properties,
        parent,
      });
    };

    if (maybeParents.length) {
      // 获取第一个支持拖入的容器
      for (const candidate of maybeParents) {
        if (
          candidate.isVisible() &&
          candidate.isNode() &&
          this.shapeRegistry.isDroppable({ parent: candidate, sourceType: type, graph })
        ) {
          // 尝试调整分组大小
          requestAnimationFrame(() => {
            this.resizeGroupIfNeeded(candidate);
          });
          return insert(candidate);
        }
      }
    }

    // 插入到顶级
    insert();
  };

  /**
   * 处理连线，这个只有在用户手动拖拽的时候才会触发
   * @param evt
   */
  handleEdgeConnected: GraphBindingProps['onEdge$Connected'] = evt => {
    const { isNew, edge, type } = evt;

    if (isNew) {
      console.log('new connect', evt);

      // 插入新的边节点
      const shapeName = (edge.getData() as BaseNodeProperties)?.__node_name__ ?? 'edge';

      // 转换为 model 上的节点
      this.editorCommandHandler.createNode({
        name: shapeName,
        type: 'edge',
        properties: {
          source: edge.getSource(),
          target: edge.getTarget(),
        },
      });

      // 移除画布上的旧节点
      this.graph?.removeCell(edge.id, wrapPreventListenerOptions({}));
    } else {
      // 可能来源或目标都修改了
      console.log('connect changed', evt);
      const model = this.shapeRegistry.getModelByCell(edge);
      if (model) {
        if (type === 'source') {
          this.editorCommandHandler.updateNodeProperty({ node: model, path: 'source', value: edge.getSource() });
        } else {
          this.editorCommandHandler.updateNodeProperty({ node: model, path: 'target', value: edge.getTarget() });
        }
      }
    }
  };

  handleEdgeRemoved: GraphBindingProps['onEdge$Removed'] = evt => {
    console.log('edge remove', evt);
    const { edge } = evt;
    const model = this.shapeRegistry.getModelByCell(edge);
    if (model) {
      this.editorCommandHandler.removeNode({ node: model });
    }
  };

  /**
   * 处理组件分组嵌入
   * @param evt
   */
  handleParentChange: GraphBindingProps['onCell$Change$Parent'] = evt => {
    const { previous, current, cell } = evt;

    // 避免重复触发
    if (previous === current) {
      return;
    }

    const model = this.shapeRegistry.getModelByCell(cell);

    if (model) {
      console.log('change parent', evt);
      this.editorCommandHandler.moveNode({
        child: model,
        parent: current ? this.editorIndex.getNodeById(current) : undefined,
      });
    }
  };

  handleChildrenChange: GraphBindingProps['onCell$Change$Children'] = evt => {
    const { cell } = evt;
    if (cell.isNode()) {
      this.resizeGroupIfNeeded(cell);
    }
  };

  handleCopy = () => {
    const graph = this.graph;
    if (graph == null) {
      return;
    }

    const selected = graph.getSelectedCells();
    // 过滤可以拷贝的cell
    const filteredSelected = selected.map(i => this.shapeRegistry.getModelByCell(i)).filter(booleanPredicate);
    if (filteredSelected.length) {
      // X6 在这里已经处理了一些逻辑，必须选中父节点，递归包含子节点、包含子节点之间的连线、修改 id 等等
      graph.copy(selected, { deep: true });

      // 放入剪切板
      copy(graph.getCellsInClipboard());
    }
  };

  handlePaste = () => {
    const graph = this.graph;
    if (graph == null) {
      return;
    }

    const position =
      this.graphHovering && this.currentMousePagePosition
        ? graph.pageToLocal(this.currentMousePagePosition.x, this.currentMousePagePosition.y)
        : undefined;

    paste({
      // TODO: 白名单
      position,
      visitor: payload => {
        const { type, shapeType, properties } = this.shapeRegistry.copyFactory({ payload });

        const parent = payload.parent ? this.editorIndex.getNodeById(payload.parent) : undefined;
        this.editorCommandHandler.createNode({
          id: payload.id,
          name: type,
          type: shapeType,
          properties,
          parent,
        });
      },
    });
  };

  handleRemoveSelected = () => {
    const selected = this.editorViewStore.selectedNodes;
    if (!selected.length) {
      return false;
    }

    if (selected.some(this.hasUnremovableNode)) {
      // TODO: 详细原因
      message.warning('不能删除');
      return false;
    }

    this.graph?.cleanSelection();

    // 进行删除
    return this.editorCommandHandler.removeBatched({ nodes: selected });
  };

  handleRemove = (params: { node: BaseNode }) => {
    const { node } = params;
    if (this.hasUnremovableNode(node)) {
      // TODO: 详细原因
      message.warning('不能删除');
      return false;
    }

    return this.editorCommandHandler.removeNode({ node });
  };

  handleGraphReady = (graph: Graph) => {
    this.graph = graph;

    this.shapeRegistry.bindGraph(graph);

    // 快捷键绑定
    // 删除
    graph.bindKey('backspace', e => {
      e.preventDefault();
      this.handleRemoveSelected();
    });

    // 拷贝
    graph.bindKey(['command+c', 'ctrl+c'], e => {
      e.preventDefault();
      this.handleCopy();
    });

    // 粘贴
    graph.bindKey(['command+v', 'ctrl+v'], e => {
      e.preventDefault();
      this.handlePaste();
    });
  };

  handleUndo = () => {
    this.editorCommandHandler.undo();
  };

  handleRedo = () => {
    this.editorCommandHandler.redo();
  };

  /**
   * 按需调整分组大小
   * @param node
   */
  protected resizeParentGroupIfNeeded(node?: Node) {
    if (node?.parent && node.parent.isNode()) {
      this.resizeGroupIfNeeded(node.parent);
    }
  }

  protected resizeGroupIfNeeded(node?: Node) {
    if (node == null || !node.isNode()) {
      return;
    }

    const autoResize = this.shapeRegistry.isAutoResizeGroup({ node, graph: this.graph! });

    if (!autoResize) {
      return;
    }

    this.resizeGroup(node, this.shapeRegistry.getAutoResizeGroupPadding({ node, graph: this.graph! }));
  }

  protected resizeGroup = debounce((node: Node, padding: number) => {
    const nodeChildren = node.getChildren()?.filter(c => c.isNode());
    if (!nodeChildren?.length) {
      return;
    }

    const model = this.shapeRegistry.getModelByCell(node);
    const realSize = node.getSize();
    const originSize = model?.properties.originSize ?? realSize;
    let { x, y } = node.getPosition();
    let cornerX = x + originSize.width;
    let cornerY = y + originSize.height;

    const childrenBBox = this.graph?.getCellsBBox(nodeChildren, {});
    if (!childrenBBox) {
      return;
    }

    childrenBBox.inflate(padding);

    const childrenBBoxCorner = childrenBBox.getCorner();

    let hasChange = false;
    if (childrenBBox.x < x) {
      x = childrenBBox.x;
      hasChange = true;
    }

    if (childrenBBox.y < y) {
      y = childrenBBox.y;
      hasChange = true;
    }

    if (childrenBBoxCorner.x > cornerX) {
      cornerX = childrenBBoxCorner.x;
      hasChange = true;
    }

    if (childrenBBoxCorner.y > cornerY) {
      cornerY = childrenBBoxCorner.y;
      hasChange = true;
    }

    let nextWidth = cornerX - x;
    let nextHeight = cornerY - y;

    if (nextWidth !== realSize.width || nextHeight !== realSize.height) {
      hasChange = true;
    }

    if (hasChange) {
      node.prop(
        {
          position: { x, y },
          size: { width: nextWidth, height: nextHeight },
        },
        {
          isAutoResizeGroup: true,
        }
      );
    }
  }, 300);

  protected hasUnremovableNode = (node: BaseNode): boolean => {
    if (!this.shapeRegistry.isRemovable({ model: node })) {
      return true;
    }

    if (node.children.length) {
      if (node.children.some(this.hasUnremovableNode)) {
        return true;
      }
    }

    return false;
  };

  protected setNodeSize(node: Node, autoResize: boolean) {
    this.resizeParentGroupIfNeeded(node);

    const model = this.shapeRegistry.getModelByCell(node);
    if (model) {
      const size = node.getSize();
      if (!autoResize && this.shapeRegistry.isAutoResizeGroup({ node, graph: this.graph! })) {
        // 更新原始尺寸
        this.editorCommandHandler.updateNodeProperty({ node: model, path: 'originSize', value: size });
      }

      this.editorCommandHandler.updateNodeProperty({ node: model, path: 'size', value: size });
    }
  }
}
