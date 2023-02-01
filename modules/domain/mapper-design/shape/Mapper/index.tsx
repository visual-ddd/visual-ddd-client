import { defineShape, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { createObjectMapperDSL, MapperObjectDSL, MapperObjectName } from '../../dsl';

import { MapperObjectEditor } from './Editor';
import { MapperShape } from './Shape';
import icon from './mapper.png';

const MapperReactShapeComponent = (props: ReactComponentProps) => {
  const { properties, model } = useShapeModel(props.node);

  return <MapperShape model={model} dsl={properties as unknown as MapperObjectDSL} />;
};

registerReactComponent(MapperObjectName.MapperObject, MapperReactShapeComponent);

const MapperShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={MapperObjectName.MapperObject} />;
};

const MapperAttributeComponent = () => {
  return <MapperObjectEditor />;
};

defineShape({
  name: MapperObjectName.MapperObject,
  title: '对象映射',
  description: '结构对象映射',
  shapeType: 'node',
  icon,
  initialProps() {
    return {
      ...createObjectMapperDSL(),
      zIndex: 2,
    };
  },
  copyFactory({ payload }) {
    return { uuid: payload.id };
  },
  component: MapperShapeComponent,
  attributeComponent: MapperAttributeComponent,
});
