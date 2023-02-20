import { BaseEditorModel, FormModel } from '@/lib/editor';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { NoopArray } from '@wakeapp/utils';
import { observer } from 'mobx-react';
import React, { useRef, useState } from 'react';
import { message, Modal } from 'antd';
import type { Graph, Node, Rectangle } from '@antv/x6';

import { createLaneDSL, DEFAULT_LANE_HEIGHT, DEFAULT_LANE_WIDTH, LaneDSL, LanesDSL } from '../../dsl';

import s from './Shape.module.scss';

import { useLanesDrag } from './useLanesDrag';

export interface LaneShapeProps {
  dsl: LanesDSL;
  formModel: FormModel;
  graph: Graph;
  editorModel: BaseEditorModel;
  node: Node;
}

const GAP = 40;

interface LaneProps {
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
const Lane = observer(function Lane(props: LaneProps) {
  const { value, formModel, readonly, index, onAppend, onDelete, onSizeChange, graph } = props;
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

export const LaneShape = observer(function LaneShape(props: LaneShapeProps) {
  const { dsl, formModel, graph, node, editorModel } = props;
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

  const moveChildrenUnderLine = (y: number, delta: number) => {
    const children = node.getChildren() ?? NoopArray;

    if (!children.length) {
      return false;
    }

    const childrenNeedToChange = children.filter((i): i is Node => {
      if (!i.isNode()) {
        return false;
      }

      const pos = i.getPosition();
      if (pos == null) {
        return false;
      }

      if (pos.y >= y) {
        return true;
      }

      return false;
    });

    if (!childrenNeedToChange.length) {
      return false;
    }

    for (const i of childrenNeedToChange) {
      const pos = i.getPosition();
      const newY = pos.y + delta;
      i.setPosition({ x: pos.x, y: newY });
    }

    return true;
  };

  const handleAppend: LaneProps['onAppend'] = ({ index, bbox }) => {
    const insert = () => {
      const list = formModel.getProperty('panes') as LaneDSL[];
      const newItem = createLaneDSL();
      const clone = list.slice();
      clone.splice(index + 1, 0, newItem);

      formModel.setProperty('panes', clone);
    };

    insert();
    moveChildrenUnderLine(bbox.y + bbox.height, DEFAULT_LANE_HEIGHT);
  };

  /**
   * 删除泳道
   * @param param0
   */
  const handleDelete: LaneProps['onDelete'] = ({ index, bbox }) => {
    if (dsl.panes.length === 1) {
      // 不能删除
      message.warning(`不能删除该泳道`);
      return;
    }

    Modal.confirm({
      content: '确认删除该泳道吗？',
      onOk: () => {
        const remove = () => {
          const list = formModel.getProperty('panes') as LaneDSL[];
          const clone = list.slice();
          clone.splice(index, 1);
          formModel.setProperty('panes', clone);
        };

        const removeChildren = () => {
          const children = graph.getNodesInArea(bbox, { strict: true });

          for (const i of children) {
            const node = editorModel.index.getNodeById(i.id);
            if (node) {
              editorModel.commandHandler.removeNode({ node });
            }
          }
        };

        // 移除泳道下的节点
        removeChildren();

        // 移除泳道
        remove();
        // 移动跟随节点
        moveChildrenUnderLine(bbox.y + bbox.height, -bbox.height);
      },
    });
  };

  const handleLaneSizeChange: LaneProps['onSizeChange'] = params => {
    const { index, size, delta, bbox } = params;

    moveChildrenUnderLine(bbox.y + bbox.height, delta);
    formModel.setProperty(`panes[${index}].height`, size);
  };

  return (
    <div ref={lanesDrag.instanceRef} className={s.root} style={{ width: dsl.width }}>
      {dsl.panes.map((i, idx) => {
        return (
          <Lane
            readonly={editorModel.readonly}
            onSizeChange={handleLaneSizeChange}
            key={i.uuid}
            index={idx}
            value={i}
            formModel={formModel}
            onAppend={handleAppend}
            onDelete={handleDelete}
            node={node}
            graph={graph}
          ></Lane>
        );
      })}
      <div className={`${s.resizerVertical} ${s.resizerRight}`} onMouseDown={lanesDrag.handleStart}></div>
    </div>
  );
});
