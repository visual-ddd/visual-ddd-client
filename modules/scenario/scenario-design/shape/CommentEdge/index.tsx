import { defineShape } from '@/lib/editor';

import { ScenarioObjectName } from '../../dsl';
import { EdgeComponent } from '../NormalEdge';
import { EDGE_PROPS } from '../shared';

/**
 * 默认边
 */
defineShape({
  name: ScenarioObjectName.CommentEdge,
  title: '注释边',
  shapeType: 'edge',
  component: EdgeComponent,
  staticProps: () => {
    return {
      zIndex: 1,
      ...EDGE_PROPS,
      attrs: {
        line: {
          stroke: 'var(--vd-color-gray-400)',
          sourceMarker: null,
          targetMarker: null,
        },
      },
    };
  },
});
