import { defineShape, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { ClassShape, createEntity, EntityEditor, EntityDSL } from '../../dsl';

import icon from './entity.png';

const EntityReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel(props.node).properties as unknown as EntityDSL;

  return <ClassShape dsl={properties} type="实体" style={{ backgroundColor: '#d9f7be' }} />;
};

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
    return { ...createEntity(), zIndex: 2 };
  },
  component: EntityShapeComponent,
  attributeComponent: EntityEditor,
});
