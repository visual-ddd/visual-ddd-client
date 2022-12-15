import { Graph, Node, PointLike } from '@antv/x6';

import { memo, useMemo, useRef } from 'react';
import merge from 'lodash/merge';
import { booleanPredicate, NoopObject } from '@wakeapp/utils';
import classNames from 'classnames';
import { message } from 'antd';

import { GraphBindingProps, GraphBinding, GraphBindingOptions } from '@/lib/g6-binding';

import { BaseNodeProperties, useEditorStore } from '../Model';

import s from './Canvas.module.scss';
import { Cells } from './Cells';
import { assertShapeInfo } from '../Shape';
import { wrapPreventListenerOptions } from '@/lib/g6-binding/hooks';
import { copy, paste } from './ClipboardUtils';

export interface CanvasProps extends GraphBindingProps {}

/**
 * 画布
 */
export const Canvas = memo((props: CanvasProps) => {
  const { options, children } = props;
  const { store, commandHandler, listen } = useEditorStore()!;
  const graphRef = useRef<Graph>();
  // 鼠标在画布之内
  const graphHovering = useRef<boolean>(false);
  // 鼠标在画布之类，记录鼠标的位置
  const currentMousePagePosition = useRef<PointLike>();

  const finalOptions: GraphBindingOptions = useMemo(() => {
    return merge(
      // 默认配置
      {
        background: { color: '#fffbe6' },
        grid: { size: 15, visible: true },

        // 分组嵌入
        // FIXME: X6 目前不支持批量
        embedding: {
          enabled: true,
          findParent: 'bbox',
          // 验证是否支持拖入
          validate(context) {
            return commandHandler.shapeRegistry.isEmbeddable({
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
            return commandHandler.shapeRegistry.isAllowNodeConnect(arg);
          },
          // allowNode 不太靠谱，统一使用 allowLoop 验证
          // allowNode
          createEdge(arg) {
            return commandHandler.shapeRegistry.createEdge({
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

          // 选择框
          showNodeSelectionBox: true,
          showEdgeSelectionBox: true,
          filter(cell) {
            return commandHandler.shapeRegistry.isSelectable({ cell, graph: this });
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
      } satisfies GraphBindingOptions,
      options ?? NoopObject
    );
  }, [options]);

  const handleMouseMove = (evt: React.MouseEvent) => {
    currentMousePagePosition.current = { x: evt.pageX, y: evt.pageY };
  };

  const handleMouseEnter = () => {
    graphHovering.current = true;
  };

  const handleMouseLeave = () => {
    graphHovering.current = true;
  };

  /**
   * 选择变动
   */
  const handleSelectionChanged: GraphBindingProps['onSelection$Changed'] = evt => {
    if (evt.added.length || evt.removed.length) {
      const selected = evt.selected.map(i => commandHandler.shapeRegistry.getModelByNode(i)).filter(booleanPredicate);
      commandHandler.setSelected({ selected });
    }
  };

  /**
   * 处理组件库拖入
   * @param evt
   * @returns
   */
  const handleDrop: GraphBindingProps['onDrop'] = evt => {
    const { componentData, nativeEvent, graph } = evt;

    if (!assertShapeInfo(componentData)) {
      console.error('拖入内容不包含 type');
      return;
    }

    const { type } = componentData;

    // 构造节点
    const { properties, shapeType } = commandHandler.shapeRegistry.dropFactory({ type, nativeEvent, graph });

    // 定位被拖入的父节点
    const localPoint = graph.pageToLocal(nativeEvent.pageX, nativeEvent.pageY);
    const maybeParents = graph.getNodesFromPoint(localPoint);

    // 插入操作
    const insert = (parentNode?: Node) => {
      const parent = parentNode && store.getNodeById(parentNode.id);
      commandHandler.createNode({
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
          commandHandler.shapeRegistry.isDroppable({ parent: candidate, sourceType: type, graph })
        ) {
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
  const handleEdgeConnected: GraphBindingProps['onEdge$Connected'] = evt => {
    const { isNew, edge, type } = evt;

    if (isNew) {
      console.log('new connect', evt);

      // 插入新的边节点
      const shapeName = (edge.getData() as BaseNodeProperties)?.__node_name__ ?? 'edge';

      // 转换为 model 上的节点
      commandHandler.createNode({
        name: shapeName,
        type: 'edge',
        properties: {
          source: edge.getSource(),
          target: edge.getTarget(),
        },
      });

      // 移除画布上的旧节点
      graphRef.current?.removeCell(edge.id, wrapPreventListenerOptions({}));
    } else {
      // 可能来源或目标都修改了
      console.log('connect changed', evt);
      const model = commandHandler.shapeRegistry.getModelByNode(edge);
      if (model) {
        if (type === 'source') {
          commandHandler.updateNodeProperty({ node: model, path: 'source', value: edge.getSource() });
        } else {
          commandHandler.updateNodeProperty({ node: model, path: 'target', value: edge.getTarget() });
        }
      }
    }
  };

  const handleEdgeRemoved: GraphBindingProps['onEdge$Removed'] = evt => {
    console.log('edge remove', evt);
    const { edge } = evt;
    const model = commandHandler.shapeRegistry.getModelByNode(edge);
    if (model) {
      commandHandler.removeNode({ node: model, checkValidate: false });
    }
  };

  /**
   * 处理组件分组嵌入
   * @param evt
   */
  const handleParentChange: GraphBindingProps['onCell$Change$Parent'] = evt => {
    const { previous, current, cell } = evt;

    // 避免重复触发
    if (previous === current) {
      return;
    }

    const model = store.getNodeById(cell.id);

    if (model) {
      console.log('change parent', evt);
      commandHandler.moveNode({ child: model, parent: current ? store.getNodeById(current) : undefined });
    }
  };

  const handleGraphReady = (graph: Graph) => {
    graphRef.current = graph;
    commandHandler.shapeRegistry.bindGraph(graph);

    // 快捷键绑定
    // 删除
    graph.bindKey('backspace', () => {
      commandHandler.removeSelected();
    });

    // 拷贝
    graph.bindKey(['command+c', 'ctrl+c'], e => {
      e.preventDefault();
      commandHandler.copy();
    });

    // 粘贴
    graph.bindKey(['command+v', 'ctrl+v'], e => {
      e.preventDefault();
      commandHandler.paste();
    });
  };

  listen('COPY', () => {
    const graph = graphRef.current;
    if (graph == null) {
      return;
    }

    const selected = graph.getSelectedCells();
    // 过滤可以拷贝的cell
    const filteredSelected = selected.map(i => commandHandler.shapeRegistry.getModelByNode(i)).filter(booleanPredicate);
    if (filteredSelected.length) {
      // X6 在这里已经处理了一些逻辑，必须选中父节点，递归包含子节点、包含子节点之间的连线、修改 id 等等
      graph.copy(selected, { deep: true });

      // 放入剪切板
      copy(graph.getCellsInClipboard());
    }
  });

  listen('PASTE', () => {
    const graph = graphRef.current;
    if (graph == null) {
      return;
    }

    const position =
      graphHovering.current && currentMousePagePosition.current
        ? graph.pageToLocal(currentMousePagePosition.current.x, currentMousePagePosition.current.y)
        : undefined;

    paste({
      // TODO: 白名单
      position,
      visitor(payload) {
        const { type, shapeType, properties } = commandHandler.shapeRegistry.copyFactory({ payload });

        const parent = payload.parent ? store.getNodeById(payload.parent) : undefined;
        commandHandler.createNode({
          id: payload.id,
          name: type,
          type: shapeType,
          properties,
          parent,
        });
      },
    });
  });

  listen('UNREMOVABLE', () => {
    // TODO: 详细原因
    message.warning('不能删除');
  });

  listen('NODE_REMOVED', params => {
    console.log('node removed', params.node);
    graphRef.current?.unselect(params.node.id);
  });

  listen('UNSELECT_ALL', () => {
    graphRef.current?.cleanSelection();
  });

  return (
    <GraphBinding
      options={finalOptions}
      className={classNames('vd-editor-canvas', s.root)}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onGraphReady={handleGraphReady}
      onCell$Change$Parent={handleParentChange}
      onSelection$Changed={handleSelectionChanged}
      onEdge$Connected={handleEdgeConnected}
      onEdge$Added={() => {
        console.log('edge added');
      }}
      onEdge$Removed={handleEdgeRemoved}
    >
      {/* 绑定到 Store 的节点和边 */}
      <Cells />
      {/* 外部自定义渲染 */}
      {children}
    </GraphBinding>
  );
});

Canvas.displayName = 'Canvas';
