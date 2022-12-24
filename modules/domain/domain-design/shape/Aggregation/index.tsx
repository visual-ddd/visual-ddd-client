import { defineShape, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { AggregationDSL, AggregationEditor, AggregationShape, createAggregation, DomainObjectName } from '../../dsl';

import icon from './aggregation.png';

const AggregationReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel(props.node).properties as unknown as AggregationDSL;

  return <AggregationShape dsl={properties} />;
};

registerReactComponent(DomainObjectName.Aggregation, AggregationReactShapeComponent);

export const AggregationShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={DomainObjectName.Aggregation} />;
};

const ALLOWED_CHILD = new Set<string>([DomainObjectName.Entity, DomainObjectName.ValueObject]);

/**
 * 实体
 */
defineShape({
  name: DomainObjectName.Aggregation,
  title: '聚合',
  description: '聚合',
  icon: icon,
  shapeType: 'node',
  group: true,
  autoResizeGroup: 35,
  embeddable(ctx) {
    const { childModel } = ctx;
    return !!(childModel && ALLOWED_CHILD.has(childModel.name));
  },
  droppable(ctx) {
    const { sourceType } = ctx;
    return ALLOWED_CHILD.has(sourceType);
  },
  initialProps: () => {
    return { ...createAggregation(), zIndex: 1, size: { width: 500, height: 300 }, __prevent_auto_resize__: true };
  },
  component: AggregationShapeComponent,
  attributeComponent: AggregationEditor,
});
