import { defineShape } from '@/lib/editor';

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
