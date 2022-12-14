import { Graph, Node } from '@antv/x6';
import { Selection } from '@antv/x6-plugin-selection';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { memo, useMemo, useRef } from 'react';
import merge from 'lodash/merge';
import { booleanPredicate, NoopObject } from '@wakeapp/utils';
import { useDisposer } from '@wakeapp/hooks';
import classNames from 'classnames';
import { message } from 'antd';

import { GraphBindingProps, GraphBinding } from '@/lib/g6-binding';

import { useEditorStore } from '../Model';

import s from './Canvas.module.scss';
import { Cells } from './Cells';
import { assertShapeInfo } from '../Shape';
import { wrapPreventListenerOptions } from '@/lib/g6-binding/hooks';

export interface CanvasProps extends GraphBindingProps {}

/**
 * 画布
 */
export const Canvas = memo((props: CanvasProps) => {
  const store = useEditorStore()!;
  const graphRef = useRef<Graph>();
  const disposer = useDisposer();
  const { options, children } = props;

  const finalOptions: Graph.Options = useMemo(() => {
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
            return store.shapeRegistry.isEmbeddable({
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
            return store.shapeRegistry.isAllowNodeConnect(arg);
          },
          // allowNode 不太靠谱，统一使用 allowLoop 验证
          // allowNode
          createEdge(arg) {
            return store.shapeRegistry.createEdge({
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
      } satisfies Graph.Options,
      options ?? NoopObject
    );
  }, [options]);

  /**
   * 选择变动
   */
  const handleSelectionChanged: GraphBindingProps['onSelection$Changed'] = evt => {
    if (evt.added.length || evt.removed.length) {
      const selected = evt.selected.map(i => store.shapeRegistry.getModelByNode(i)).filter(booleanPredicate);
      store.setSelected({ selected });
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

    if (!store.shapeRegistry.isShapeDefined(type)) {
      console.error(`拖入的图形（${type}）未定义`);
      return;
    }

    const shapeType = store.shapeRegistry.getShapeType(type)!;

    // 构造节点
    const properties = store.shapeRegistry.dropFactory({ type, nativeEvent, graph });

    // 定位被拖入的父节点
    const localPoint = graph.pageToLocal(nativeEvent.pageX, nativeEvent.pageY);
    const maybeParents = graph.getNodesFromPoint(localPoint);

    // 插入操作
    const insert = (parentNode?: Node) => {
      const parent = parentNode && store.getNodeById(parentNode.id);
      store.createNode({
        name: type,
        type: shapeType,
        properties,
        parent,
      });
    };

    if (maybeParents.length) {
      // 获取第一个支持拖入的容器
      for (const candidate of maybeParents) {
        if (candidate.isVisible() && store.shapeRegistry.isDroppable({ parent: candidate, sourceType: type, graph })) {
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
      const shapeType = edge.getData()?.__type__ ?? 'edge';

      // 转换为 model 上的节点
      store.createNode({
        name: shapeType,
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
      const model = store.shapeRegistry.getModelByNode(edge);
      if (model) {
        if (type === 'source') {
          store.updateNodeProperty({ node: model, path: 'source', value: edge.getSource() });
        } else {
          store.updateNodeProperty({ node: model, path: 'target', value: edge.getTarget() });
        }
      }
    }
  };

  const handleEdgeRemoved: GraphBindingProps['onEdge$Removed'] = evt => {
    console.log('edge remove', evt);
    const { edge } = evt;
    const model = store.shapeRegistry.getModelByNode(edge);
    if (model) {
      store.removeNode({ node: model }, false);
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
      store.moveNode({ child: model, parent: current ? store.getNodeById(current) : undefined });
    }
  };

  const handleGraphReady = (graph: Graph) => {
    graphRef.current = graph;
    store.shapeRegistry.bindGraph(graph);

    // 插件扩展

    // 选中控制
    graph.use(
      new Selection({
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
          return store.shapeRegistry.isSelectable({ cell, graph: this });
        },
      })
    );

    // 快捷键
    graph.use(
      new Keyboard({
        // 单个页面可能存在多个画布实例
        global: false,
        enabled: true,
      })
    );

    graph.use(
      new Clipboard({
        enabled: true,
        useLocalStorage: false,
      })
    );

    // 删除
    graph.bindKey('backspace', () => {
      store.removeSelected();
    });

    graph.bindKey(['command+c', 'ctrl+c'], () => {
      const selected = graph.getSelectedCells();
      // 过滤可以拷贝的cell
      const filteredSelected = selected.map(i => store.shapeRegistry.getModelByNode(i)).filter(booleanPredicate);
      if (filteredSelected.length) {
        // X6 在这里已经处理了一些逻辑，必须选中父节点，递归包含子节点、包含子节点之间的连线、修改 id 等等
        graph.copy(selected, { deep: true });

        // 数据转换
      }
    });

    graph.bindKey(['command+v', 'ctrl+v'], () => {
      console.log(graph.getCellsInClipboard());
      // graph.paste();
    });

    // 监听 store 事件
    disposer.push(
      store.on('UNSELECT_ALL', () => {
        graph.cleanSelection();
      }),
      store.on('NODE_REMOVED', params => {
        console.log('node removed', params.node);
        graph.unselect(params.node.id);
      }),
      store.on('UNREMOVABLE', () => {
        // TODO: 详细
        message.warning('不能删除');
      })
    );
  };

  return (
    <GraphBinding
      options={finalOptions}
      className={classNames('vd-editor-canvas', s.root)}
      onDrop={handleDrop}
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
