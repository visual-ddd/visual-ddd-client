import { defineShape, ShapeComponentProps } from '@/lib/editor';
import { EdgeBinding } from '@/lib/g6-binding';
import { Edge } from '@antv/x6';
import { useMemo } from 'react';

import { ScenarioObjectName } from '../../dsl';
import { EDGE_PROPS } from '../shared';

export const EdgeComponent = (props: ShapeComponentProps) => {
  const cellProps = props.cellProps;
  const { source: originSource, target: originTarget } = cellProps;

  /**
   * 强制不连接到锚点上，这样在节点移动时会灵活一些
   */
  const source = useMemo(() => {
    if (originSource) {
      return { cell: (originSource as Edge.TerminalCellData).cell };
    }
  }, [originSource]);

  const target = useMemo(() => {
    if (originTarget) {
      return { cell: (originTarget as Edge.TerminalCellData).cell };
    }
  }, [originTarget]);

  return <EdgeBinding {...props.cellProps} source={source} target={target} />;
};

/**
 * 默认边
 */
defineShape({
  name: ScenarioObjectName.NormalEdge,
  title: '边',
  shapeType: 'edge',
  component: EdgeComponent,
  staticProps: () => {
    return { zIndex: 1, ...EDGE_PROPS };
  },
});
