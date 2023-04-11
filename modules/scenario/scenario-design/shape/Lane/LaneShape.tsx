import { BaseEditorModel, FormModel } from '@/lib/editor';
import { NoopArray } from '@wakeapp/utils';
import { observer } from 'mobx-react';
import { message, Modal } from 'antd';
import type { Graph, Node } from '@antv/x6';

import { createLaneDSL, DEFAULT_LANE_HEIGHT, DEFAULT_LANE_WIDTH, LaneDSL, LanesDSL } from '../../dsl';

import s from './LaneShape.module.scss';

import { useLanesDrag } from './useLanesDrag';
import { GAP } from './constants';
import { Lane, LaneProps } from './Lane';

export interface LaneShapeProps {
  dsl: LanesDSL;
  formModel: FormModel;
  graph: Graph;
  editorModel: BaseEditorModel;
  node: Node;
}

export const LaneShape = observer(function LaneShape(props: LaneShapeProps) {
  const { dsl, formModel, graph, node, editorModel } = props;
  const readonly = editorModel.readonly;
  const getNodesUnderNodeBBox = () => {
    return graph.getNodesInArea(node.getBBox(), { strict: false }).filter(i => i.id !== node.id);
  };

  const lanesDrag = useLanesDrag({
    direction: 'vertical',
    /**
     * 计算容器内的所有元素，得出最小宽度
     * @returns
     */
    min: () => {
      const children = getNodesUnderNodeBBox() ?? NoopArray;
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
    const children = getNodesUnderNodeBBox() ?? NoopArray;

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
            readonly={readonly}
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
      {!readonly && (
        <div className={`${s.resizerVertical} ${s.resizerRight}`} onMouseDown={lanesDrag.handleStart}></div>
      )}
    </div>
  );
});
