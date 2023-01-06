import { defineShape, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { DomainObjectName, createQuery, QueryDSL, ClassShape, ClassDSL, QueryEditor } from '../../dsl';

import icon from './query.png';

const QueryReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel(props.node).properties as unknown as QueryDSL;

  return (
    <ClassShape
      dsl={properties as unknown as ClassDSL}
      type="查询"
      style={{
        backgroundColor: '#b8f5ec',
      }}
    />
  );
};

registerReactComponent(DomainObjectName.Query, QueryReactShapeComponent);

const QueryShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={DomainObjectName.Query} />;
};

const QueryAttributeComponent = () => {
  return <QueryEditor />;
};

/**
 * 实体
 */
defineShape({
  name: DomainObjectName.Query,
  title: '查询',
  description: '查询',
  icon: icon,
  shapeType: 'node',
  initialProps: () => {
    return { ...createQuery(), zIndex: 2 };
  },
  copyFactory({ payload }) {
    return { uuid: payload.id };
  },
  component: QueryShapeComponent,
  attributeComponent: QueryAttributeComponent,
});
