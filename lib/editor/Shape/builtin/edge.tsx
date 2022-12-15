import { EdgeBinding } from '@/lib/g6-binding';
import { defineShape } from '../defineShape';

/**
 * 默认边
 */
defineShape('edge', {
  shapeType: 'edge',
  initialProps: () => {
    return { attrs: { line: { stroke: 'red' } } };
  },
  component(props) {
    return (
      <EdgeBinding
        {...props.cellProps}
        label={props.model.properties.label}
        tools={['target-arrowhead', 'source-arrowhead']}
      />
    );
  },
});
