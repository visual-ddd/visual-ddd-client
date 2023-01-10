import { defineShape, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';
import { createDataObjectDSL, DataObjectDSL, DataObjectName } from '../../dsl';
import { DataObjectEditor } from './DataObjectEditor';
import { DataObjectShape } from './DataObjectShape';

const DataObjectReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel(props.node).properties as unknown as DataObjectDSL;

  return <DataObjectShape dsl={properties}></DataObjectShape>;
};

registerReactComponent(DataObjectName.DataObject, DataObjectReactShapeComponent);

const DataObjectShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={DataObjectName.DataObject} />;
};

const DataObjectAttributeComponent = () => {
  return <DataObjectEditor />;
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
