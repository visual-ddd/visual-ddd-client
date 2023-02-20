import { FormModel } from '@/lib/editor';
import { EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { NoopArray } from '@wakeapp/utils';
import { observer } from 'mobx-react';
import React, { useRef, useState } from 'react';
import type { Graph, Node, Rectangle } from '@antv/x6';

import { createLaneDSL, DEFAULT_LANE_HEIGHT, DEFAULT_LANE_WIDTH, LaneDSL, LanesDSL } from '../../dsl';

import s from './Shape.module.scss';

import { useLanesDrag } from './useLanesDrag';

export interface LaneShapeProps {
  dsl: LanesDSL;
  formModel: FormModel;
  graph: Graph;
  node: Node;
}

const GAP = 40;

interface LaneProps {
  value: LaneDSL;
  index: number;
  formModel: FormModel;
  onAppend: (index: number) => void;
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
const Lane = observer(function Lane(props: LaneProps) {
  const { value, formModel, index, onAppend, onSizeChange, graph } = props;
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
      const nodesUnderBBOX = graph.getNodesInArea(paneBBox, { strict: true });

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

    onAppend(index);
  };

  const handleNameEditStart = (evt: React.MouseEvent) => {
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
      <div className={s.creator} onClick={handleAppend}>
        <PlusCircleOutlined />
      </div>
      <aside className={s.aside}>
        <span
          ref={nameRef}
          className={s.title}
          dangerouslySetInnerHTML={{ __html: value.title || '未命名泳道' }}
          contentEditable={editing}
          onDoubleClick={handleNameEditStart}
          onBlur={handleNameEditCancel}
        ></span>
        <EditOutlined className={s.edit} onClick={handleNameEditStart} />
      </aside>
      <main className={s.container}>x</main>
      <div className={`${s.resizerHorizontal} ${s.resizerBottom}`} onMouseDown={laneDrag.handleStart}></div>
    </section>
  );
});

export const LaneShape = observer(function LaneShape(props: LaneShapeProps) {
  const { dsl, formModel, graph, node } = props;
  const lanesDrag = useLanesDrag({
    direction: 'vertical',
    /**
     * 计算容器内的所有元素，得出最小宽度
     * @returns
     */
    min: () => {
      const children = node.getChildren() ?? NoopArray;
      if (!children.length) {
        return DEFAULT_LANE_WIDTH;
      }

      const bbox = graph.getCellsBBox(children);
      if (bbox == null) {
        return DEFAULT_LANE_WIDTH;
      }

      const bboxRightEdge = bbox.x + bbox.width;

      const nodePosition = node.getPosition();
      const nodeSize = node.getSize();
      const nodeRightEdge = nodePosition.x + nodeSize.width;

      return Math.max(DEFAULT_LANE_WIDTH, bboxRightEdge - nodeRightEdge + nodeSize.width + GAP);
    },
    update(v) {
      formModel.setProperty('width', v);
    },
  });

  const handleAppend = (index: number) => {
    const list = formModel.getProperty('panes') as LaneDSL[];
    const newItem = createLaneDSL();
    const clone = list.slice();
    clone.splice(index + 1, 0, newItem);

    formModel.setProperty('panes', clone);
  };

  const handleLaneSizeChange: LaneProps['onSizeChange'] = params => {
    const { index, size, delta, bbox } = params;
    // 获取所有在指定节点横向之下的节点
    const updateSize = () => {
      formModel.setProperty(`panes[${index}].height`, size);
    };
    const children = node.getChildren() ?? NoopArray;

    if (!children.length) {
      updateSize();
      return;
    }

    const childrenNeedToChange = children.filter((i): i is Node => {
      if (!i.isNode()) {
        return false;
      }

      const pos = i.getPosition();
      if (pos == null) {
        return false;
      }

      if (pos.y >= bbox.y + bbox.height) {
        return true;
      }

      return false;
    });

    if (!childrenNeedToChange.length) {
      updateSize();
      return;
    }

    for (const i of childrenNeedToChange) {
      const pos = i.getPosition();
      const newY = pos.y + delta;
      i.setPosition({ x: pos.x, y: newY });
    }

    updateSize();
  };

  return (
    <div ref={lanesDrag.instanceRef} className={s.root} style={{ width: dsl.width }}>
      {dsl.panes.map((i, idx) => {
        return (
          <Lane
            onSizeChange={handleLaneSizeChange}
            key={i.uuid}
            index={idx}
            value={i}
            formModel={formModel}
            onAppend={handleAppend}
            node={node}
            graph={graph}
          ></Lane>
        );
      })}
      <div className={`${s.resizerVertical} ${s.resizerRight}`} onMouseDown={lanesDrag.handleStart}></div>
    </div>
  );
});
