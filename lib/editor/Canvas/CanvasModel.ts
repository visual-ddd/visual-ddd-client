import { Graph, PointLike, Node, Cell, Edge } from '@antv/x6';
import { Transform } from '@antv/x6-plugin-transform';
import { booleanPredicate, debounce, Disposer, NoopArray } from '@wakeapp/utils';
import { message } from 'antd';
import memoize from 'lodash/memoize';

import { wrapPreventListenerOptions } from '@/lib/g6-binding/hooks';
import { GraphBindingOptions, GraphBindingProps } from '@/lib/g6-binding';
import { IDisposable } from '@/lib/utils';

import { CanvasEvent } from './CanvasEvent';
import { BaseEditorModel, BaseNode, EditorInspectTab } from '../Model';
import { NormalizedAutoResizeGroup, ShapeRegistry } from '../Shape';
import { assertShapeInfo } from '../Shape';
import { copyByCell, copyByPayload, CopyPayload, paste } from './ClipboardUtils';
import { CanvasKeyboardBinding } from './KeyboardBinding';
import { ContextMenuController } from './ContextMenuController';
import { autoLayout } from './layout';

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

declare global {
  interface IBaseEditorScopeMembers {
    canvasModel: CanvasModel;
  }
}

type Resizing = GraphBindingOptions['resizing'];

const DEFAULT_SELECTED_COLOR = '#1890ff';

export interface CanvasModelOptions {
  /**
   * 已选择节点、边的高亮颜色
   */
  selectedColor?: string;

  /**
   * 选项初始化完毕，可以在这里对选项进行修改
   * @param options
   */
  onOptionsCreated?(options: GraphBindingOptions): void;
}

/**
 * 这个模型是无状态的，核心状态保存在 EditorModel
 * 这里主要是为了几种处理画布(View)相关逻辑, 会耦合 UI
 */
export class CanvasModel implements IDisposable {
  private static indexInstanceByGraph = new WeakMap<Graph, CanvasModel>();
  static registerModel(graph: Graph, model: CanvasModel) {
    this.indexInstanceByGraph.set(graph, model);
  }

  static getModel(graph: Graph) {
    return this.indexInstanceByGraph.get(graph);
  }

  /**
   * 画布事件
   */
  event: CanvasEvent = new CanvasEvent();

  /**
   * 图形组件管理器
   */
  shapeRegistry: ShapeRegistry;

  /**
   * 快捷键管理器
   */
  keyboardBinding: CanvasKeyboardBinding;

  /**
   * 右键菜单控制器
   */
  contextMenuController: ContextMenuController;

  /**
   * 编辑器模型
   */
  editorModel: BaseEditorModel;

  /**
   * 是否为只读模式
   */
  get readonly() {
    return this.editorModel.readonly;
  }

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

  get editorFormStore() {
    return this.editorModel.formStore;
  }

  get editorPropertyLocationObserver() {
    return this.editorModel.propertyLocationObserver;
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

  /**
   * 节点移动中
   */
  private nodeMoving = false;

  /**
   * 节点调整大小中
   */
  private resizing = false;

  /**
   * 配置项
   */
  private options: CanvasModelOptions;

  /**
   * 储存临时的节点状态
   */
  private tempNodeState: WeakMap<Cell, any> = new WeakMap();

  constructor(inject: { editorModel: BaseEditorModel; options?: CanvasModelOptions }) {
    this.options = inject.options ?? {};
    this.editorModel = inject.editorModel;
    const shapeRegistry = (this.shapeRegistry = new ShapeRegistry({ editorModel: inject.editorModel }));
    this.editorModel.scope.registerScopeMember('canvasModel', this);
    const readonly = this.readonly;
    this.contextMenuController = new ContextMenuController({
      canvasModel: this,
      getContextMenuForTarget(context) {
        if (context.target?.cell) {
          return shapeRegistry.getContextMenu({ cell: context.target.cell });
        }
      },
    });

    const self = this;
    let resizing: Resizing = false;

    // 尺寸变换配置
    if (!readonly) {
      resizing = {
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
    }

    // 默认配置
    this.graphOptions = {
      background: { color: '#f8f8f8' },
      grid: { size: 20, visible: true },
      onEdgeLabelRendered: args => {
        shapeRegistry.renderEdgeLabel(args);
      },

      // 体验不好，暂时关闭
      // minimap: {
      //   width: 200,
      //   height: 150,
      //   padding: 10,
      // },

      highlighting: {
        embedding: {
          name: 'stroke',
          args: {
            attrs: {
              'stroke-width': 6,
              stroke: '#3ba0ffad',
            },
          },
        },
      },

      // 支持鼠标滚轮操作
      mousewheel: {
        enabled: true,
        // 通过滚动缩放大小
        zoomAtMousePosition: true,

        // 缩放因子，默认是 1.2, 但是在 macos 触控板是会非常灵敏
        // 因此这里设置稍微小一点
        factor: 1.05,
        // 缩放大小的修饰符
        modifiers: ['meta', 'ctrl'],
      },

      // 画布拖拽平移
      panning: {
        enabled: this.editorModel.viewStore.viewState.mouseDragMode === 'panning',
      },

      // 缩放限制
      scaling: {
        min: 0.1,
        max: 3.5,
      },

      // 支持对齐线
      snapline: {
        enabled: !readonly,
        tolerance: 8,
      },

      // 画布滚动
      // 体验不是特别好，先使用原生的 panning
      // scroller: {
      //   enabled: true,
      //   pannable: true,
      //   pageVisible: true,
      //   pageBreak: true,
      // },

      // 分组嵌入
      // FIXME: X6 目前不支持批量
      embedding: {
        enabled: !readonly,
        findParent: 'bbox',
        frontOnly: false,
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
          return shapeRegistry.createTempEdge({
            graph: this,
            cell: arg.sourceCell,
            magnet: arg.sourceMagnet,
          });
        },
        validateMagnet(arg) {
          return shapeRegistry.isAllowMagnetCreateEdge({
            graph: this,
            cell: arg.cell,
            magnet: arg.magnet,
          });
        },
      },

      // 交互行为
      interacting: readonly
        ? false
        : {
            nodeMovable(view) {
              return self.canMove(view.cell);
            },
            edgeMovable: true,
            // TODO: 暂时不支持标签移动
            edgeLabelMovable: false,
            arrowheadMovable: true,
            magnetConnectable: true,
            vertexDeletable: true,
            vertexAddable: true,
            vertexMovable: true,
          },

      // 自动根据容器调整大小
      autoResize: true,

      // 选中处理
      selection: {
        enabled: true,
        multiple: true,

        // 框选
        rubberband: this.editorModel.viewStore.viewState.mouseDragMode === 'select',

        // 严格框选
        strict: true,

        // 选择框, 选择框可能会阻挡事件?
        showNodeSelectionBox: true,
        // showEdgeSelectionBox: true, // edge 选择框是方形
        pointerEvents: 'none', // SelectionBox 会阻挡事件
        filter(cell) {
          return shapeRegistry.isSelectable({ cell, graph: this });
        },
      },

      // 快捷键处理
      keyboard: {
        global: true,
        enabled: true,
        // 单个页面可能存在多个画布实例, 通过 editorModel 判断是否激活
        guard: () => {
          return this.editorModel.isActive;
        },
      },

      // 剪切板
      clipboard: {
        enabled: !readonly,
        useLocalStorage: false,
      },

      resizing,
      rotating: {
        enabled: readonly
          ? false
          : function (node) {
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

    // 快捷键绑定
    this.keyboardBinding = new CanvasKeyboardBinding();

    if (!readonly) {
      this.keyboardBinding
        .bindKey({
          name: 'delete',
          title: '删除',
          description: '删除选中图形',
          key: 'backspace',
          handler: this.handleRemoveSelected,
        })
        .bindKey({
          name: 'lock',
          title: '锁定/解锁',
          key: { macos: 'command+shift+l', other: 'ctrl+shift+l' },
          handler: this.handleToggleSelectedNodeLock,
        })
        .bindKey({
          name: 'copy',
          title: '拷贝',
          description: '拷贝选中图形',
          key: { macos: 'command+c', other: 'ctrl+c' },
          guard: () => {
            return this.graphHovering;
          },
          handler: this.handleCopy,
        })
        .bindKey({
          name: 'paste',
          title: '粘贴',
          key: { macos: 'command+v', other: 'ctrl+v' },
          handler: this.handlePaste,
        })
        .bindKey({
          name: 'undo',
          title: '撤销',
          key: { macos: 'command+z', other: 'ctrl+z' },
          handler: this.handleUndo,
        })

        .bindKey({
          name: 'redo',
          title: '重做',
          key: { macos: 'shift+command+z', other: 'ctrl+y' },
          handler: this.handleRedo,
        });

      this.keyboardBinding
        .bindKey({
          name: 'up',
          title: '向上移动',
          key: { macos: 'up', other: 'up' },
          handler: this.handleMoveSelected.bind(this, { direction: 'y', value: -1 }),
        })
        .bindKey({
          name: 'down',
          title: '向下移动',
          key: { macos: 'down', other: 'down' },
          handler: this.handleMoveSelected.bind(this, { direction: 'y', value: 1 }),
        })
        .bindKey({
          name: 'left',
          title: '向左移动',
          key: { macos: 'left', other: 'left' },
          handler: this.handleMoveSelected.bind(this, { direction: 'x', value: -1 }),
        })
        .bindKey({
          name: 'right',
          title: '向右移动',
          key: { macos: 'right', other: 'right' },
          handler: this.handleMoveSelected.bind(this, { direction: 'x', value: 1 }),
        });
    }

    // 选项初始化完毕
    this.options.onOptionsCreated?.(this.graphOptions);

    this.keyboardBinding
      .bindKey({
        name: 'mouseSelectMode',
        title: '框选',
        description: '启用鼠标框选模式',
        key: { macos: 'shift+command+s', other: 'shift+ctrl+s' },
        handler: this.handleEnableMouseSelectMode,
      })
      .bindKey({
        name: 'mousePanningMode',
        title: '画布拖拽',
        description: '启用鼠标拖拽画布模式',
        key: { macos: 'shift+command+p', other: 'shift+ctrl+p' },
        handler: this.handleEnableMousePanningMode,
      })
      .bindKey({
        name: 'selectAll',
        title: '全选',
        description: '全选所有节点',
        key: { macos: 'command+a', other: 'ctrl+a' },
        handler: this.handleSelectAll,
      })

      .bindKey({
        name: 'zoomIn',
        title: '放大',
        key: { macos: ['command+plus', 'command+='], other: ['ctrl+plus', 'ctrl+='] },
        handler: this.handleZoomIn,
      })
      .bindKey({
        name: 'zoomOut',
        title: '缩小',
        key: { macos: 'command+-', other: 'ctrl+-' },
        handler: this.handleZoomOut,
      })
      .bindKey({
        name: 'zoomToFit',
        title: '适配内容',
        key: { macos: 'shift+command+f', other: 'shift+ctrl+f' },
        handler: this.handleZoomToFit,
      })
      .bindKey({
        name: 'showAttributes',
        title: '显示属性面板',
        key: { macos: 'command+shift+a', other: 'ctrl+shift+a' },
        handler: this.handleShowAttributesTab,
      })
      .bindKey({
        name: 'showProblems',
        title: '显示问题面板',
        key: { macos: 'command+shift+p', other: 'ctrl+shift+p' },
        handler: this.handleShowProblemTab,
      });

    // 监听 EditorModel 事件
    this.disposer.push(
      this.editorModel.event.on('NODE_REMOVED', params => {
        console.log('node removed', params.node);
        this.graph?.unselect(params.node.id);
      }),
      this.editorModel.event.on('CMD_FOCUS_NODE', params => {
        this.handleSelect({ cellIds: [params.node.id] });
      }),
      this.editorModel.event.on('CMD_RE_LAYOUT', () => {
        this.handleLayout();
      }),
      this.editorModel.event.on('EDITOR_VIEW_STATE_RECOVERED', ({ state }) => {
        if (state.canvasScale != null) {
          const { sx, sy, ox, oy } = state.canvasScale;
          this.graph?.scale(sx, sy, ox, oy);
        }

        if (state.canvasTranslate != null) {
          const { tx, ty } = state.canvasTranslate;
          this.graph?.translate(tx, ty);
        }

        if (state.mouseDragMode != null) {
          if (state.mouseDragMode === 'select') {
            this.handleEnableMouseSelectMode();
          } else {
            this.handleEnableMousePanningMode();
          }
        }
      }),
      this.contextMenuController.dispose,
      // 监听节点定位
      this.editorPropertyLocationObserver.subscribeAnonymous(evt => {
        if (this.editorViewStore.focusingNode?.id !== evt.nodeId) {
          this.handleSelect({ cellIds: [evt.nodeId] });
        }

        // 字段定位, 需要打开侧边栏
        if (evt.path && this.editorViewStore.viewState.rightSidebarFolded) {
          this.editorCommandHandler.setViewStateDebounce({ key: 'rightSidebarFolded', value: false });
        }
      })
    );
  }

  /**
   * 资源释放
   */
  dispose = () => {
    this.disposer.release();
  };

  getNodeById = (nodeId: string) => {
    return this.editorIndex.getNodeById(nodeId);
  };

  /**
   * 获取节点的可见性
   * @param nodeId
   * @returns
   */
  getNodeVisible = (nodeId: string) => {
    const cell = this.graph?.getCellById(nodeId);
    return cell?.isVisible() ?? true;
  };

  getCommandDescription = memoize((name: string) => {
    return this.keyboardBinding.getReadableKeyBinding(name);
  });

  /**
   * 是否支持选中
   * @param node
   * @returns
   */
  canSelect(node: Cell | BaseNode): boolean {
    const cell = node instanceof BaseNode ? this.graph?.getCellById(node.id) : node;

    if (!cell) {
      return false;
    }

    return this.shapeRegistry.isSelectable({ cell });
  }

  /**
   * 是否支持复制
   * 如果没有传递参数，则表示处理已选中元素
   */
  canCopy(): boolean;
  canCopy(cell: Cell): boolean;
  canCopy(cell: BaseNode): boolean;
  canCopy(cell?: BaseNode | Cell): boolean {
    const canCopyNode = (model: BaseNode): boolean => {
      return this.shapeRegistry.isCopyable({ model });
    };

    if (cell == null) {
      if (!this.editorViewStore.selectedNodes.length) {
        return false;
      }

      return this.editorViewStore.selectedNodes.every(canCopyNode);
    }

    const model = cell instanceof BaseNode ? cell : this.shapeRegistry.getModelByCell(cell);

    if (model == null) {
      return false;
    }

    return canCopyNode(model);
  }

  /**
   * 是否支持移动
   * @param cell
   */
  canMove(node: Cell | BaseNode) {
    const model = node instanceof BaseNode ? node : this.shapeRegistry.getModelByCell(node);

    if (model && model.isHierarchyLocked) {
      return false;
    }

    const cell = node instanceof BaseNode ? this.graph?.getCellById(node.id) : node;

    if (cell) {
      return this.shapeRegistry.isMovable({ cell });
    }

    return false;
  }

  /**
   * 是否支持删除
   * 如果没有传递参数，则表示处理已选中元素
   */
  canRemove(): boolean;
  canRemove(cell: Cell): boolean;
  canRemove(cell: BaseNode): boolean;
  canRemove(cell?: BaseNode | Cell): boolean {
    const canRemoveNode = (model: BaseNode): boolean => {
      return !this.hasUnremovableNode(model);
    };

    if (this.readonly) {
      return false;
    }

    if (cell == null) {
      if (!this.editorViewStore.selectedNodes.length) {
        return false;
      }

      return this.editorViewStore.selectedNodes.every(canRemoveNode);
    }

    const model = cell instanceof BaseNode ? cell : this.shapeRegistry.getModelByCell(cell);

    if (model == null) {
      return false;
    }

    return canRemoveNode(model);
  }

  /**
   * 是否可以锁定或解锁
   * @returns
   */
  canLockOrUnlock() {
    if (this.readonly) {
      return;
    }

    return this.editorViewStore.selectedNodes.length === 1;
  }

  /**
   * 判断节点是否锁定
   * 如果没有传递参数，则表示处理已选中元素
   * @param cell
   * @returns
   */
  isLocked(cell?: Cell | BaseNode): boolean | undefined {
    if (cell == null && this.editorViewStore.selectedNodes.length === 1) {
      cell = this.editorViewStore.selectedNodes[0];
    }

    if (cell == null) {
      return;
    }

    const model = cell instanceof BaseNode ? cell : this.shapeRegistry.getModelByCell(cell);

    return model?.locked;
  }

  /**
   * 获取节点的关注状态
   * @param nodeId
   * @returns
   */
  getNodeAwarenessState(nodeId: string) {
    return this.editorViewStore.remoteFocusing.find(i => i.node.id === nodeId);
  }

  /**
   * 设置图形的可见性
   *
   * @note 可见性不会持久化
   *
   * @param nodeId
   * @param visible
   */
  handleSetNodeVisible = (params: { id: string; visible: boolean; includeChildren?: boolean }) => {
    const { id, visible, includeChildren } = params;

    const cell = this.graph?.getCellById(id);

    if (cell) {
      cell.setVisible(visible);

      // 递归
      if (includeChildren) {
        const children = cell.getChildren();
        if (children?.length) {
          for (const child of children) {
            if (child.isNode()) {
              this.handleSetNodeVisible({ id: child.id, visible, includeChildren });
            }
          }
        }
      }
    }
  };

  handleMouseMove = (evt: React.MouseEvent) => {
    this.currentMousePagePosition = { x: evt.pageX, y: evt.pageY };
  };

  handleMouseEnter = () => {
    this.graphHovering = true;
  };

  handleMouseLeave = () => {
    this.graphHovering = false;
  };

  handleBlankContextMenu: GraphBindingProps['onBlank$Contextmenu'] = evt => {
    const { e } = evt;
    this.contextMenuController.trigger({ event: e as unknown as MouseEvent });
  };

  /**
   * 节点右键菜单
   * @param evt
   */
  handleCellContextMenu: GraphBindingProps['onCell$Contextmenu'] = evt => {
    const { cell, e } = evt;

    const model = this.shapeRegistry.getModelByCell(cell);

    if (model == null) {
      return;
    }

    this.contextMenuController.trigger({ event: e as unknown as MouseEvent, target: { cell, model } });
  };

  /**
   * 触发右键菜单
   * @param params
   */
  handleTriggerContextMenu = (params: { node: BaseNode | Cell; event: MouseEvent }) => {
    const { node, event } = params;
    const cell: Cell = node instanceof BaseNode ? this.graph!.getCellById(node.id)! : node;
    const model = node instanceof BaseNode ? node : this.shapeRegistry.getModelByCell(cell)!;

    this.contextMenuController.trigger({
      event: event,
      target: { cell, model },
    });
  };

  /**
   * 放大
   */
  handleZoomIn = () => {
    if (this.graph == null) {
      return;
    }
    const zoom = this.graph.zoom();

    this.handleZoomTo(zoom + 0.25);
  };

  /**
   * 缩小
   */
  handleZoomOut = () => {
    if (this.graph == null) {
      return;
    }
    const zoom = this.graph.zoom();

    this.handleZoomTo(zoom - 0.25);
  };

  handleZoomTo = (zoom: number) => {
    this.graph?.zoomTo(zoom);
  };

  handleZoomToFit = () => {
    // this.graph?.zoomTo(1);
    // this.graph?.center();
    this.graph?.zoomToFit({ padding: 20, maxScale: 1.2 });
    this.graph?.centerContent();
  };

  /**
   * 处理画布缩放
   * @param evt
   */
  handleScaleChange: GraphBindingProps['onScale'] = evt => {
    const { sx, sy, ox, oy } = evt;

    this.editorCommandHandler.setViewStateDebounce({
      key: 'canvasScale',
      value: { sx, sy, ox, oy },
    });
  };

  /**
   * 处理画布偏移
   * @param evt
   */
  handleTranslateChange: GraphBindingProps['onTranslate'] = evt => {
    const { tx, ty } = evt;

    this.editorCommandHandler.setViewStateDebounce({
      key: 'canvasTranslate',
      value: { tx, ty },
    });
  };

  handleZIndexChange: GraphBindingProps['onCell$Change$ZIndex'] = evt => {
    const { cell, current } = evt;
    const node = this.shapeRegistry.getModelByCell(cell);

    if (node) {
      this.editorCommandHandler.updateNodeProperty({ node, path: 'zIndex', value: current });
    }
  };

  /**
   * 处理可见性变动
   * @param evt
   */
  handleVisibleChange: GraphBindingProps['onCell$Change$Visible'] = evt => {
    const { cell, current } = evt;

    // 取消选择
    if (!current) {
      this.graph?.unselect(cell.id);
    }
  };

  handleMoveSelected = (params: { direction: 'x' | 'y'; value: number }) => {
    const { direction, value } = params;
    const cells = this.graph?.getSelectedCells()?.filter((i): i is Node => i.isNode());
    if (cells?.length !== 1) {
      return;
    }

    const cell = cells[0];

    if (!this.canMove(cell)) {
      return;
    }

    const point = { ...cell.getPosition() };
    if (direction === 'x') {
      point.x += value;
    } else {
      point.y += value;
    }

    cell.setPosition(point);
  };

  /**
   * 节点开始移动
   * @param evt
   */
  handleNodeMove: GraphBindingProps['onNode$Move'] = evt => {
    this.nodeMoving = true;
    console.log('move start', evt.node);
  };

  /**
   * 节点位置变更，不管是用户手动拖动还是程序，都会触发这个事件
   * @param evt
   */
  handleNodeChangePosition: GraphBindingProps['onNode$Change$Position'] = evt => {
    if (this.nodeMoving) {
      // 用户正在拖拽中，这种情况等到 moved 事件再去处理
      return;
    }

    // 更新位置
    const { node } = evt;
    const model = this.editorIndex.getNodeById(node.id);
    if (model) {
      this.editorCommandHandler.updateNodeProperty({ node: model, path: 'position', value: node.getPosition() });
    }
  };

  /**
   * 节点移动结束, 这个是用户手动触发
   * @param evt
   */
  handleNodeMoved: GraphBindingProps['onNode$Moved'] = evt => {
    this.nodeMoving = false;
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
   * 开始拖拽, 这个是用户手动拖拽调整大小时触发
   * @param evt
   */
  handleNodeResizeStart: GraphBindingProps['onNode$Resize'] = evt => {
    this.resizing = true;
  };

  /**
   * 节点变更, 不管是用户手动拖拽还是自动调整大小都会触发
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

  /**
   * 节点尺寸变更，这个是用户手动拖拽触发的
   * @param evt
   */
  handleNodeResized: GraphBindingProps['onNode$Resized'] = evt => {
    this.resizing = false;
    const { node } = evt;

    this.setNodeSize(node, false);
  };

  /**
   * 边选中
   * @param evt
   */
  handleEdgeSelected: GraphBindingProps['onEdge$Selected'] = evt => {
    const edge = evt.edge;

    this.highlightEdge(edge);
  };

  /**
   * 边取消选中
   * @param evt
   */
  handleEdgeUnselected: GraphBindingProps['onEdge$Unselected'] = evt => {
    const edge = evt.edge;

    this.unhighlightEdge(edge);
  };

  /**
   * 选择变动
   */
  handleSelectionChanged: GraphBindingProps['onSelection$Changed'] = evt => {
    if (evt.added.length || evt.removed.length) {
      const selected = evt.selected.map(i => this.shapeRegistry.getModelByCell(i)).filter(booleanPredicate);
      this.editorCommandHandler.setSelected({ selected });

      this.highlightOutgoingEdges(evt.selected);
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
      const node = this.editorCommandHandler.createNode({
        id: properties.uuid,
        name: type,
        type: shapeType,
        properties,
        parent,
      });

      // 选中
      setTimeout(() => {
        this.graph?.resetSelection(node.id);
      }, 300);
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

      // 转换为 model 上的节点
      this.editorCommandHandler.createNode(this.shapeRegistry.edgeFactory({ edge }));

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

  handleLockNode = (params: { node: BaseNode }) => {
    this.editorCommandHandler.lock({ node: params.node });
  };

  handleUnLockNode = (params: { node: BaseNode }) => {
    this.editorCommandHandler.unlock({ node: params.node });
  };

  handleToggleLock = (params: { node: BaseNode }) => {
    if (params.node.locked) {
      this.handleUnLockNode(params);
    } else {
      this.handleLockNode(params);
    }
  };

  /**
   * 切换已选择节点的锁定状态
   * @returns
   */
  handleToggleSelectedNodeLock = () => {
    const selected = this.editorViewStore.selectedNodes;
    if (selected.length !== 1) {
      return;
    }

    this.handleToggleLock({ node: selected[0] });
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
    this.handleCopyCells(selected);
  };

  handleCopyPayloads = (payloads: CopyPayload[]) => {
    copyByPayload(payloads);
  };

  handleCopyCells = (cells: Cell[]) => {
    const graph = this.graph!;
    // 过滤可以拷贝的cell
    const filteredCells = cells.map(i => this.shapeRegistry.getModelByCell(i)).filter(booleanPredicate);
    if (filteredCells.length) {
      // X6 在这里已经处理了一些逻辑，必须选中父节点，递归包含子节点、包含子节点之间的连线、修改 id 等等
      graph.copy(cells, { deep: true });

      // 放入剪切板
      copyByCell(graph.getCellsInClipboard());
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
      whitelist: this.editorModel.whitelist,
      position,
      beforePaste: () => {
        this.graph?.cleanSelection();
      },
      visitor: payload => {
        const { type, shapeType, properties } = this.shapeRegistry.copyFactory({ payload });

        const parent = payload.parent ? this.editorIndex.getNodeById(payload.parent) : undefined;
        const node = this.editorCommandHandler.createNode({
          id: payload.id,
          name: type,
          type: shapeType,
          properties,
          parent,
        });

        setTimeout(() => {
          this.graph?.select(node.id);
        }, 300);
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
    CanvasModel.registerModel(graph, this);

    this.graph = graph;

    this.shapeRegistry.bindGraph(graph);

    // 快捷键绑定
    this.keyboardBinding.bindGraph(graph);

    // 恢复缩放比例
    const scale = this.editorViewStore.viewState.canvasScale;
    if (scale) {
      requestAnimationFrame(() => {
        graph.scale(scale.sx, scale.sy, scale.ox, scale.oy);
      });
    }
  };

  handleUndo = () => {
    this.editorCommandHandler.undo();
  };

  handleRedo = () => {
    this.editorCommandHandler.redo();
  };

  /**
   * 切换到鼠标拖拽选择模式
   */
  handleEnableMouseSelectMode = () => {
    this.graph?.disablePanning();
    this.graph?.enableRubberband();
    this.editorCommandHandler.setViewState({ key: 'mouseDragMode', value: 'select' });
  };

  /**
   * 切换到鼠标拖拽移动画布模式
   */
  handleEnableMousePanningMode = () => {
    this.graph?.enablePanning();
    this.graph?.disableRubberband();
    this.editorCommandHandler.setViewState({ key: 'mouseDragMode', value: 'panning' });
  };

  /**
   * 新增选择项
   * @param params
   */
  handleAddSelect = (params: { cellIds: string[] }) => {
    this.graph?.select(params.cellIds);
  };

  handleIncrementZIndex = (params: { cell: Cell; value?: number }) => {
    const { cell, value = 1 } = params;

    const incrementZIndex = (target: Cell) => {
      const current = target.getZIndex() ?? 1;
      const next = current + value;

      target.setZIndex(next);

      const children = target.getChildren();

      if (children?.length) {
        for (const child of children) {
          incrementZIndex(child);
        }
      }
    };

    incrementZIndex(cell);
  };

  handleToFront = (params: { cell: Cell }) => {
    params.cell.toFront({ deep: true });
  };

  handleToBack = (params: { cell: Cell }) => {
    params.cell.toBack({ deep: true });
  };

  /**
   * 节点选择
   * @param params
   */
  handleSelect = (params: { cellIds: string[] }) => {
    const { cellIds } = params;

    if (cellIds.length) {
      const cells = cellIds
        .map(i => this.graph?.getCellById(i))
        .filter(booleanPredicate)
        .filter(i => i.isVisible());

      this.graph?.resetSelection(cells);

      if (cells.length === 1) {
        this.graph?.centerCell(cells[0]);
      }
    }
  };

  /**
   * 全选
   */
  handleSelectAll = () => {
    const cells = this.graph?.getCells() ?? NoopArray;
    this.graph?.select(cells);
  };

  /**
   * 拷贝为图片
   */
  handleExportAsImage = () => {
    // FIXME: 会出现样式错乱，后面使用其他方案
    this.graph?.exportSVG(undefined, { copyStyles: true });
  };

  /**
   * 显示属性面板
   */
  handleShowAttributesTab = () => {
    this.editorCommandHandler.setViewState({
      key: 'rightSidebarFolded',
      value: false,
    });

    this.editorCommandHandler.setViewState({
      key: 'inspectTab',
      value: EditorInspectTab.Attributes,
    });
  };

  /**
   * 显示问题面板
   */
  handleShowProblemTab = () => {
    this.editorCommandHandler.setViewState({
      key: 'rightSidebarFolded',
      value: false,
    });

    this.editorCommandHandler.setViewState({
      key: 'inspectTab',
      value: EditorInspectTab.Problems,
    });
  };

  /**
   * 重新布局
   */
  handleLayout = () => {
    const changedNodes = autoLayout(this.graph!);

    for (const node of changedNodes) {
      const cell = this.graph?.getCellById(node.id);
      if (cell && cell.isNode()) {
        cell.setPosition({ x: node.x, y: node.y });
      }
    }
  };

  /**
   * 高亮出边
   * @param cells
   */
  protected highlightOutgoingEdges(cells: Cell[]) {
    const graph = this.graph;
    if (graph == null) {
      return;
    }

    const edges = graph.getEdges();
    const edgesToHighlight = new Set<Edge>();

    for (const cell of cells) {
      if (cell.isEdge()) {
        edgesToHighlight.add(cell);
      } else if (cell.isNode()) {
        const outgoings = graph.getOutgoingEdges(cell);
        outgoings?.forEach(i => edgesToHighlight.add(i));
      }
    }

    for (const edge of edges) {
      if (edgesToHighlight.has(edge)) {
        this.highlightEdge(edge);
      } else {
        this.unhighlightEdge(edge);
      }
    }
  }

  /**
   * 高亮边
   */
  protected highlightEdge(edge: Edge) {
    if (this.tempNodeState.has(edge)) {
      // 已激活
      return;
    }

    const oldStroke = edge.attr('line/stroke');
    const oldStrokeWidth = edge.attr('line/strokeWidth');

    this.tempNodeState.set(edge, { stroke: oldStroke, strokeWidth: oldStrokeWidth });

    edge.attr('line/stroke', this.options.selectedColor ?? DEFAULT_SELECTED_COLOR);
    edge.attr('line/strokeWidth', 3);
  }

  /**
   * 取消边高亮
   * @param edge
   */
  protected unhighlightEdge(edge: Edge) {
    const oldStrokeState = this.tempNodeState.get(edge) as { stroke: string; strokeWidth: number } | undefined;

    if (oldStrokeState) {
      edge.attr('line/stroke', oldStrokeState.stroke);
      edge.attr('line/strokeWidth', oldStrokeState.strokeWidth);

      this.tempNodeState.delete(edge);
    }
  }

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

    const autoResize = this.shapeRegistry.getAutoResizeGroupConfig({ node, graph: this.graph! });

    if (!autoResize) {
      return;
    }

    this.resizeGroup(node, autoResize);
  }

  protected resizeGroup = debounce((node: Node, config: NormalizedAutoResizeGroup) => {
    const { padding, minHeight, minWidth } = config;
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
    if (childrenBBox.x !== x) {
      x = childrenBBox.x;
      hasChange = true;
    }

    if (childrenBBox.y !== y) {
      y = childrenBBox.y;
      hasChange = true;
    }

    if (childrenBBoxCorner.x !== cornerX) {
      cornerX = childrenBBoxCorner.x;
      hasChange = true;
    }

    if (childrenBBoxCorner.y !== cornerY) {
      cornerY = childrenBBoxCorner.y;
      hasChange = true;
    }

    let nextWidth = Math.max(cornerX - x, minWidth);
    let nextHeight = Math.max(cornerY - y, minHeight);

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

  /**
   * 是否包含不能删除的节点
   * @param node
   * @returns
   */
  protected hasUnremovableNode = (node: BaseNode): boolean => {
    if (!this.shapeRegistry.isRemovable({ model: node })) {
      return true;
    }

    /**
     * 节点锁定
     */
    if (this.editorViewStore.isNodeLocked(node)) {
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
