import { FormModel } from '@/lib/editor';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import React, { useRef, useState } from 'react';
import type { Graph, Node, Rectangle } from '@antv/x6';

import { DEFAULT_LANE_HEIGHT, LaneDSL } from '../../dsl';

import s from './LaneShape.module.scss';
import { useLanesDrag } from './useLanesDrag';
import { GAP } from './constants';

export interface LaneProps {
  readonly: boolean;
  value: LaneDSL;
  index: number;
  formModel: FormModel;
  onAppend: (params: { index: number; rect: DOMRect; bbox: Rectangle }) => void;
  onDelete: (params: { index: number; rect: DOMRect; bbox: Rectangle }) => void;
  onSizeChange: (params: {
    index: number;
    size: number;
    oldSize: number;
    rect: DOMRect;
    bbox: Rectangle;
    delta: number;
  }) => void;
  node: Node;
  graph: Graph;
}

// TODO: 考虑缩放和偏移
export const Lane = observer(function Lane(props: LaneProps) {
  const { value, formModel, readonly, index, onAppend, onDelete, onSizeChange, graph, node } = props;
  const [editing, setEditing] = useState(false);
  const nameRef = useRef<HTMLSpanElement>(null);

  const laneDrag = useLanesDrag({
    direction: 'horizontal',
    /**
     * 获取区域内的节点，计算最小高度
     */
    min: () => {
      const instance = laneDrag.instanceRef.current;
      if (instance == null) {
        return DEFAULT_LANE_HEIGHT;
      }

      const rect = instance.getBoundingClientRect();
      const paneBBox = graph.clientToLocal(rect.left, rect.top, rect.width, rect.height);
      const nodesUnderBBOX = graph.getNodesInArea(paneBBox, { strict: true }).filter(i => i !== node);

      if (!nodesUnderBBOX.length) {
        return DEFAULT_LANE_HEIGHT;
      }

      const bbox = graph.getCellsBBox(nodesUnderBBOX);

      if (bbox == null) {
        return DEFAULT_LANE_HEIGHT;
      }

      const paneBottomEdge = paneBBox.y + paneBBox.height;
      const nodesBottomEdge = bbox.y + bbox.height;

      return Math.min(
        Math.max(DEFAULT_LANE_HEIGHT, nodesBottomEdge - paneBottomEdge + paneBBox.height + GAP),
        paneBBox.height
      );
    },
    update(v) {
      const instance = laneDrag.instanceRef.current!;
      const rect = instance.getBoundingClientRect();
      const bbox = graph.clientToLocal(rect.left, rect.top, rect.width, rect.height);
      const size = v;
      const oldSize = instance.offsetHeight;

      onSizeChange({
        index,
        size,
        oldSize,
        delta: size - oldSize,
        rect: rect,
        bbox,
      });
    },
  });

  const handleAppend = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();

    const instance = laneDrag.instanceRef.current!;
    const rect = instance.getBoundingClientRect();
    const bbox = graph.clientToLocal(rect.left, rect.top, rect.width, rect.height);

    onAppend({ index, rect, bbox });
  };

  const handleDelete = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();

    const instance = laneDrag.instanceRef.current!;
    const rect = instance.getBoundingClientRect();
    const bbox = graph.clientToLocal(rect.left, rect.top, rect.width, rect.height);

    onDelete({ index, rect, bbox });
  };

  const handleNameEditStart = (evt: React.MouseEvent) => {
    if (readonly) {
      return;
    }

    evt.stopPropagation();
    evt.preventDefault();

    setEditing(true);

    requestAnimationFrame(() => {
      nameRef.current?.focus();

      const selection = window.getSelection();
      selection?.removeAllRanges();

      const range = document.createRange();
      range.selectNodeContents(nameRef.current!);

      selection?.addRange(range);
    });
  };

  const handleNameEditCancel = (evt: React.FocusEvent) => {
    evt.stopPropagation();
    setEditing(false);

    const newTitle = nameRef.current?.textContent || '未命名泳道';

    if (newTitle !== value.title) {
      formModel.setProperty(`panes[${index}].title`, newTitle);
    }
  };

  return (
    <section
      ref={laneDrag.instanceRef}
      className={s.lane}
      style={{
        height: value.height,
      }}
    >
      {!readonly && (
        <div className={s.creator} onClick={handleAppend}>
          <PlusCircleOutlined />
        </div>
      )}
      <aside className={s.aside}>
        <span
          ref={nameRef}
          className={s.title}
          dangerouslySetInnerHTML={{ __html: value.title || '未命名泳道' }}
          contentEditable={editing}
          onDoubleClick={handleNameEditStart}
          onBlur={handleNameEditCancel}
        ></span>

        {!readonly && (
          <div className={s.icons}>
            <EditOutlined className={s.icon} onClick={handleNameEditStart} />
            <DeleteOutlined className={s.icon} onClick={handleDelete} />
          </div>
        )}
      </aside>
      <main className={s.container}></main>
      <div className={`${s.resizerHorizontal} ${s.resizerBottom}`} onMouseDown={laneDrag.handleStart}></div>
    </section>
  );
});
