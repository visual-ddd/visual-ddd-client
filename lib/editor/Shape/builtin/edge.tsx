import { EdgeBinding } from '@/lib/g6-binding';
import { defineShape } from '../defineShape';

/**
 * 默认边
 */
defineShape({
  name: 'edge',
  title: '默认边',
  shapeType: 'edge',
  staticProps: () => {
    return { attrs: { line: { stroke: 'red' } } };
  },
  component(props) {
    return (
      <EdgeBinding
        {...props.cellProps}
        label={props.node.properties.label}
        tools={['target-arrowhead', 'source-arrowhead']}
      />
    );
  },
});
