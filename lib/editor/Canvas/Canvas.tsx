import { memo, useMemo } from 'react';
import merge from 'lodash/merge';
import { NoopObject } from '@wakeapp/utils';
import classNames from 'classnames';

import { GraphBindingProps, GraphBinding, GraphBindingOptions } from '@/lib/g6-binding';

import s from './Canvas.module.scss';
import { Cells } from './Cells';
import { useCanvasModel } from './CanvasModelContext';

export interface CanvasProps extends GraphBindingProps {}

/**
 * 画布
 */
export const Canvas = memo((props: CanvasProps) => {
  const { options, children } = props;
  const { model: canvasModel } = useCanvasModel();

  const finalOptions: GraphBindingOptions = useMemo(() => {
    return merge(canvasModel.graphOptions, options ?? NoopObject);
  }, [options, canvasModel]);

  return (
    <GraphBinding
      options={finalOptions}
      className={classNames('vd-editor-canvas', s.root)}
      onDrop={canvasModel.handleDrop}
      onMouseMove={canvasModel.handleMouseMove}
      onMouseEnter={canvasModel.handleMouseEnter}
      onMouseLeave={canvasModel.handleMouseLeave}
      onGraphReady={canvasModel.handleGraphReady}
      onCell$Change$ZIndex={canvasModel.handleZIndexChange}
      onCell$Change$Parent={canvasModel.handleParentChange}
      onNode$Moved={canvasModel.handleNodeMoved}
      onNode$Resize={canvasModel.handleNodeResizeStart}
      onNode$Change$Size={canvasModel.handleNodeSizeChange}
      onNode$Resized={canvasModel.handleNodeResized}
      onNode$Rotated={canvasModel.handleNodeRotated}
      onNode$Removed={evt => console.log('node remove', evt)}
      onEdge$Connected={canvasModel.handleEdgeConnected}
      onEdge$Added={evt => console.log('edge added', evt)}
      onEdge$Removed={canvasModel.handleEdgeRemoved}
      onSelection$Changed={canvasModel.handleSelectionChanged}
    >
      {/* 绑定到 Store 的节点和边 */}
      <Cells />
      {/* 外部自定义渲染 */}
      {children}
    </GraphBinding>
  );
});

Canvas.displayName = 'Canvas';
