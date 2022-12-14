import { Graph, Node } from '@antv/x6';
import { Selection } from '@antv/x6-plugin-selection';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { memo, useMemo } from 'react';
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

export interface CanvasProps extends GraphBindingProps {}

/**
 * 画布
 */
export const Canvas = memo((props: CanvasProps) => {
  const store = useEditorStore()!;
  const disposer = useDisposer();
  const { options } = props;

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

    // 构造节点
    const properties = store.shapeRegistry.dropFactory({ type, nativeEvent, graph });

    // 定位被拖入的父节点
    const localPoint = graph.pageToLocal(nativeEvent.pageX, nativeEvent.pageY);
    const maybeParents = graph.getNodesFromPoint(localPoint);

    // 插入操作
    const insert = (parentNode?: Node) => {
      const parent = parentNode && store.getNodeById(parentNode.id);
      store.createNode({
        type,
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
        showNodeSelectionBox: true,
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

    // 删除
    graph.bindKey('backspace', () => {
      store.removeSelected();
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
    >
      <Cells />
    </GraphBinding>
  );
});

Canvas.displayName = 'Canvas';
