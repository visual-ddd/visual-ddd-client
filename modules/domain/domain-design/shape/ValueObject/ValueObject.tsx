import { defineShape, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { ClassShape, createValueObject, ValueObjectDSL, ValueObjectEditor } from '../../dsl';

import icon from './value-object.png';

const ValueObjectReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel(props.node).properties as unknown as ValueObjectDSL;

  return <ClassShape dsl={properties} type="值对象" style={{ backgroundColor: '#BAE7FF' }} />;
};

registerReactComponent('value-object', ValueObjectReactShapeComponent);

export const ValueObjectShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component="value-object" />;
};

/**
 * 实体
 */
defineShape({
  name: 'value-object',
  title: '值对象',
  description: '值对象',
  icon: icon,
  shapeType: 'node',

  initialProps: () => {
    return { ...createValueObject(), zIndex: 2 };
  },
  component: ValueObjectShapeComponent,
  attributeComponent: ValueObjectEditor,
});
