import { defineShape, EdgeLabelComponentProps } from '@/lib/editor';
import { observer } from 'mobx-react';

import { createLabelEdge, LabelEdgeDSL, ScenarioObjectName } from '../../dsl';
import { EdgeComponent } from '../NormalEdge';
import { EDGE_PROPS } from '../shared';
import { Label } from './Label';

/**
 * 默认边
 */
defineShape({
  name: ScenarioObjectName.LabelEdge,
  title: '标签边',
  shapeType: 'edge',
  edgeLabelComponent: observer(({ node, model }: EdgeLabelComponentProps) => {
    const properties = node.properties as unknown as LabelEdgeDSL;
    const isLocked = model.readonly || model.viewStore.isNodeLocked(node);

    return (
      <Label
        disabled={isLocked}
        onChange={(value: string) => {
          model.commandHandler.updateNodeProperty({ node, path: 'label', value });
        }}
      >
        {properties.label}
      </Label>
    );
  }),
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
