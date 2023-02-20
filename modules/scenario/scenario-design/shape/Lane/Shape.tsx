import { FormModel } from '@/lib/editor';
import { EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import type { Graph, Node } from '@antv/x6';

import { createLaneDSL, DEFAULT_LANE_HEIGHT, DEFAULT_LANE_WIDTH, LaneDSL, LanesDSL } from '../../dsl';

import s from './Shape.module.scss';
import { NoopArray } from '@wakeapp/utils';

export interface LaneShapeProps {
  dsl: LanesDSL;
  formModel: FormModel;
  graph: Graph;
  node: Node;
}

const GAP = 40;

/**
 * 整体泳道只能横向扩展
 */
function useLanesDrag(options: {
  direction: 'horizontal' | 'vertical';
  min: number | (() => number);
  update: (value: number) => void;
}) {
  const instanceRef = useRef<HTMLDivElement>(null);
  const disposer = useRef<Function>();

  const handleStart = (evt: React.MouseEvent) => {
    if (disposer.current != null) {
      disposer.current();
      disposer.current = undefined;
    }

    evt.stopPropagation();
    evt.preventDefault();

    const getValueFromEvent = (e: MouseEvent) => {
      return options.direction === 'vertical' ? e.pageX : e.pageY;
    };

    const instance = instanceRef.current!;

    let start = getValueFromEvent(evt.nativeEvent);
    let disposed = false;
    let dragging = false;
    let ghost: HTMLElement | null = null;

    const height = instance.offsetHeight;
    const width = instance.offsetWidth;
    const min = typeof options.min === 'function' ? options.min() : options.min;

    const relativeValue = options.direction === 'vertical' ? width : height;

    console.log('down');

    const handleMove = (evt: MouseEvent) => {
      if (!dragging) {
        ghost = document.createElement('div');
        ghost.className = s.ghost;
        ghost.style.height = `${height}px`;
        ghost.style.width = `${width}px`;
        instance.appendChild(ghost);
      }

      dragging = true;
      const delta = getValueFromEvent(evt) - start;
      const newValue = Math.max(relativeValue + delta, min);

      if (options.direction === 'vertical') {
        ghost!.style.width = `${newValue}px`;
      } else {
        ghost!.style.height = `${newValue}px`;
      }
    };

    const dispose = () => {
      if (disposed) {
        return;
      }

      disposed = true;

      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('mouseleave', handleEnd);

      if (ghost) {
        ghost.remove();
      }
    };

    const handleEnd = (evt: MouseEvent) => {
      if (disposed) {
        return;
      }

      if (ghost) {
        const delta = getValueFromEvent(evt) - start;
        const newValue = Math.max(relativeValue + delta, min);
        if (newValue !== relativeValue) {
          // 触发修改
          options.update(newValue);
        }
      }

      dispose();
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('mouseleave', handleEnd);
    disposer.current = dispose;
  };

  useEffect(() => {
    disposer.current?.();
  }, []);

  return { instanceRef, handleStart };
}

const Lane = observer(function Lane(props: {
  value: LaneDSL;
  index: number;
  formModel: FormModel;
  onAppend: (index: number) => void;
}) {
  const { value, formModel, index, onAppend } = props;
  const [editing, setEditing] = useState(false);
  const nameRef = useRef<HTMLSpanElement>(null);

  const laneDrag = useLanesDrag({
    direction: 'horizontal',
    min: DEFAULT_LANE_HEIGHT,
    update(v) {
      formModel.setProperty(`panes[${index}].height`, v);
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

  return (
    <div ref={lanesDrag.instanceRef} className={s.root} style={{ width: dsl.width }}>
      {dsl.panes.map((i, idx) => {
        return <Lane key={i.uuid} index={idx} value={i} formModel={formModel} onAppend={handleAppend}></Lane>;
      })}
      <div className={`${s.resizerVertical} ${s.resizerRight}`} onMouseDown={lanesDrag.handleStart}></div>
    </div>
  );
});
