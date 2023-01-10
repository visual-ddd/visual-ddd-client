import { defineShape, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';
import { createDataObjectDSL, DataObjectDSL, DataObjectName } from '../../dsl';

const DataObjectReactShapeComponent = (props: ReactComponentProps) => {
  // @ts-expect-error
  const properties = useShapeModel(props.node).properties as unknown as DataObjectDSL;

  return <div>TODO</div>;
};

registerReactComponent(DataObjectName.DataObject, DataObjectReactShapeComponent);

const DataObjectShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={DataObjectName.DataObject} />;
};

const DataObjectAttributeComponent = () => {
  return <div>TODO</div>;
};

defineShape({
  name: DataObjectName.DataObject,
  title: '数据对象',
  description: '数据对象建模',
  shapeType: 'node',
  initialProps() {
    return {
      ...createDataObjectDSL(),
      zIndex: 2,
    };
  },
  copyFactory({ payload }) {
    return { uuid: payload.id };
  },
  component: DataObjectShapeComponent,
  attributeComponent: DataObjectAttributeComponent,
});
