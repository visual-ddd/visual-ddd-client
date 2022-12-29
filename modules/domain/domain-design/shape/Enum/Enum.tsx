import { defineShape, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { createEnum, DomainObjectName, EnumDSL, EnumShape, EnumEditor } from '../../dsl';

import icon from './enum.png';

const EnumReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel(props.node).properties as unknown as EnumDSL;

  return <EnumShape dsl={properties} />;
};

registerReactComponent(DomainObjectName.Enum, EnumReactShapeComponent);

const EnumShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={DomainObjectName.Enum} />;
};

const EnumAttributeComponent = () => {
  return <EnumEditor />;
};

/**
 * 实体
 */
defineShape({
  name: DomainObjectName.Enum,
  title: '枚举',
  description: '枚举',
  icon: icon,
  shapeType: 'node',

  initialProps: () => {
    return { ...createEnum(), zIndex: 2 };
  },
  component: EnumShapeComponent,
  attributeComponent: EnumAttributeComponent,
});
