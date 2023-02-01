import { defineShape, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { createObjectMapperDSL, MapperObjectDSL, MapperObjectName } from '../../dsl';

import icon from './mapper.png';

const MapperReactShapeComponent = (props: ReactComponentProps) => {
  // @ts-expect-error
  const properties = useShapeModel(props.node).properties as unknown as MapperObjectDSL;

  return <div>TODO: 图形</div>;
};

registerReactComponent(MapperObjectName.MapperObject, MapperReactShapeComponent);

const MapperShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={MapperObjectName.MapperObject} />;
};

const MapperAttributeComponent = () => {
  return <div>TODO: editor</div>;
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
