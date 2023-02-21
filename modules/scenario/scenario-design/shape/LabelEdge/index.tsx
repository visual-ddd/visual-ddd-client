import { defineShape, ShapeComponentProps } from '@/lib/editor';
import { EdgeBinding } from '@/lib/g6-binding';
import { Edge } from '@antv/x6';
import { useMemo } from 'react';

import { createLabelEdge, LabelEdgeDSL, ScenarioObjectName } from '../../dsl';
import { EDGE_PROPS } from '../shared';
import { Label } from './Label';

const EdgeComponent = (props: ShapeComponentProps) => {
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
  name: ScenarioObjectName.LabelEdge,
  title: '标签边',
  shapeType: 'edge',
  edgeLabelComponent: ({ node, model }) => {
    const properties = node.properties as unknown as LabelEdgeDSL;

    return (
      <Label
        onChange={(value: string) => {
          model.commandHandler.updateNodeProperty({ node, path: 'label', value });
        }}
      >
        {properties.label}
      </Label>
    );
  },
  initialProps: () => {
    return {
      zIndex: 1,
      ...createLabelEdge(),
    };
  },
  staticProps: () => {
    return { zIndex: 1, ...EDGE_PROPS };
  },
  component: EdgeComponent,
});
