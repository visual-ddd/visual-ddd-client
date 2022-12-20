import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { Disposer, rafDebounce } from '@wakeapp/utils';
import { Cell, Node } from '@antv/x6';

import classNames from 'classnames';

import { useGraphBinding } from '../GraphBinding';

import s from './BBox.module.scss';

export interface NodeBBoxProps {
  /**
   * 节点
   */
  node?: string | Node;

  /**
   * 渲染内容
   */
  children?: ReactNode | ((scope: { cell: Cell }) => ReactNode);

  style?: React.CSSProperties;
  className?: string;
}

/**
 * 在指定 Node 的 BBox 下渲染自定义内容
 */
export const NodeBBox: FC<NodeBBoxProps> = props => {
  const { className, style, node, children } = props;
  const graphContext = useGraphBinding();
  const containerRef = useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<Cell>();

  // 需要监听节点移除、事件
  useEffect(() => {
    if (node == null) {
      return;
    }

    const nodeId = typeof node === 'string' ? node : node.id;
    const disposer = new Disposer();

    disposer.push(
      graphContext.onCellReady(cell => {
        setInstance(cell);
      }, nodeId),
      graphContext.onCellDestroyed(cell => {
        setInstance(undefined);
      }, nodeId)
    );

    return disposer.release;
  }, [node]);

  // 监听 cell 变更
  useEffect(() => {
    if (!instance) {
      return;
    }

    const graph = instance.model?.graph;
    if (!graph) {
      return;
    }

    const updateState = () => {
      const style = containerRef.current?.style;
      if (!style) {
        return;
      }

      style.visibility = instance.visible ? 'visible' : 'hidden';

      if (!instance.visible) {
        return;
      }

      const rectangle = graph.getCellsBBox([instance]);

      if (!rectangle) {
        return;
      }

      // 需要考虑画布平移、缩放等因素
      const graphRectangle = graph.localToGraph(rectangle);

      const { x, y, width, height } = graphRectangle;

      style.width = `${width}px`;
      style.height = `${height}px`;
      style.transform = `translate(${x}px, ${y}px)`;
    };

    const listener = rafDebounce(() => {
      // 变更 bbox
      updateState();
    });

    graph.on('scale', listener);
    graph.on('resize', listener);
    graph.on('translate', listener);
    instance.on('change:*', listener);

    updateState();

    return () => {
      instance.off('change:*', listener);
      graph.off('scale', listener);
      graph.off('resize', listener);
      graph.off('translate', listener);
    };
  }, [instance]);

  if (instance == null) {
    return null;
  }

  return (
    <div className={classNames('node-bbox', className, s.root)} style={style} ref={containerRef}>
      {typeof children === 'function' ? children({ cell: instance }) : children}
    </div>
  );
};

NodeBBox.displayName = 'NodeBBox';
