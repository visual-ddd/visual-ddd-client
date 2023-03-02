import { memo, useMemo } from 'react';
import merge from 'lodash/merge';
import { NoopObject } from '@wakeapp/utils';
import classNames from 'classnames';

import { GraphBindingProps, GraphBinding, GraphBindingOptions } from '@/lib/g6-binding';

import s from './Canvas.module.scss';
import { Cells } from './Cells';
import { useCanvasModel } from './CanvasModelContext';
import { Awareness } from './Awareness';
import { ContextMenu } from './ContextMenu';

export interface CanvasProps extends GraphBindingProps {}

/**
 * 画布
 */
export const Canvas = memo((props: CanvasProps) => {
  const { options, children, className, style, ...other } = props;
  const { model: canvasModel } = useCanvasModel();

  const finalOptions: GraphBindingOptions = useMemo(() => {
    return merge(canvasModel.graphOptions, options ?? NoopObject);
  }, [options, canvasModel]);

  return (
    <GraphBinding
      options={finalOptions}
      className={classNames('vd-editor-canvas', s.root, className, { readonly: canvasModel.readonly })}
      style={style}
      minimapClassName={s.minimap}
      onDrop={canvasModel.handleDrop}
      onScale={canvasModel.handleScaleChange}
      onMouseMove={canvasModel.handleMouseMove}
      onMouseEnter={canvasModel.handleMouseEnter}
      onMouseLeave={canvasModel.handleMouseLeave}
      onGraphReady={canvasModel.handleGraphReady}
      onBlank$Contextmenu={canvasModel.handleBlankContextMenu}
      // 通用
      onCell$Change$ZIndex={canvasModel.handleZIndexChange}
      onCell$Change$Parent={canvasModel.handleParentChange}
      onCell$Change$Children={canvasModel.handleChildrenChange}
      onCell$Change$Visible={canvasModel.handleVisibleChange}
      onCell$Contextmenu={canvasModel.handleCellContextMenu}
      // 节点
      onNode$Move={canvasModel.handleNodeMove}
      onNode$Change$Position={canvasModel.handleNodeChangePosition}
      onNode$Moved={canvasModel.handleNodeMoved}
      onNode$Resize={canvasModel.handleNodeResizeStart}
      onNode$Change$Size={canvasModel.handleNodeSizeChange}
      onNode$Resized={canvasModel.handleNodeResized}
      onNode$Rotated={canvasModel.handleNodeRotated}
      onNode$Removed={evt => console.log('node remove', evt)}
      onNode$Embedded={evt => console.log('node embed', evt)}
      // 边
      onEdge$Connected={canvasModel.handleEdgeConnected}
      onEdge$Added={evt => console.log('edge added', evt)}
      onEdge$Removed={canvasModel.handleEdgeRemoved}
      onEdge$Selected={canvasModel.handleEdgeSelected}
      onEdge$Unselected={canvasModel.handleEdgeUnselected}
      onSelection$Changed={canvasModel.handleSelectionChanged}
      {...other}
    >
      {/* 绑定到 Store 的节点和边 */}
      <Cells />
      {/* 协作用户聚焦  */}
      <Awareness />
      <ContextMenu />
      {/* 外部自定义渲染 */}
      {children}
    </GraphBinding>
  );
});

Canvas.displayName = 'Canvas';
