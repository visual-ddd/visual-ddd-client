import { defineShape, ShapeComponentProps } from '@/lib/editor';
import { ReactComponentBinding, registerReactComponent } from '@/lib/g6-binding';

import { createEntity, EntityEditor } from '../../dsl';

import { EntityReactShapeComponent } from './ReactShapeComponent';
import icon from './entity.png';

registerReactComponent('entity', EntityReactShapeComponent);

export const EntityShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component="entity" />;
};

/**
 * 实体
 */
defineShape({
  name: 'entity',
  title: '实体',
  description: '领域实体',
  icon: icon,
  shapeType: 'node',

  initialProps: () => {
    return createEntity();
  },
  component: EntityShapeComponent,
  attributeComponent: EntityEditor,
});
