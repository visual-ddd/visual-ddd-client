import { Graph, Node } from '@antv/x6';
import { memo, useMemo } from 'react';
import merge from 'lodash/merge';
import { NoopObject } from '@wakeapp/utils';
import classNames from 'classnames';

import { GraphBindingProps, GraphBinding } from '@/lib/g6-binding';

import { BaseNode, useEditorStore } from '../Model';

import s from './Canvas.module.scss';
import { Cells } from './Cells';
import { assertShapeInfo, ShapeCoreInfo } from '../Shape';

export interface CanvasProps extends GraphBindingProps {}

/**
 * 画布
 */
export const Canvas = memo((props: CanvasProps) => {
  const store = useEditorStore()!;
  const { options } = props;

  const finalOptions: Graph.Options = useMemo(() => {
    return merge(
      // 默认配置
      {
        background: { color: '#fffbe6' },
        grid: { size: 15, visible: true },
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
        // 自动根据容器调整大小
        autoResize: true,

        // 对齐线
        // @ts-expect-error
        snapline: true,
      } satisfies Graph.Options,
      options ?? NoopObject
    );
  }, [options]);

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
        if (store.shapeRegistry.isDroppable({ parent: candidate, sourceType: type, graph })) {
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

  return (
    <GraphBinding
      options={finalOptions}
      className={classNames('vd-editor-canvas', s.root)}
      onDrop={handleDrop}
      onGraphReady={store.shapeRegistry.bindGraph}
      onCell$Change$Parent={handleParentChange}
    >
      <Cells />
    </GraphBinding>
  );
});

Canvas.displayName = 'Canvas';
