import { defineShape, FormRuleReportType, ROOT_FIELD, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import {
  AggregationDSL,
  checkDomainObjectNameConflict,
  createAggregation,
  DomainObjectName,
  getDomainObjectFromValidatorContext,
} from '../../dsl';
import { DomainObjectAggregation } from '../../model';

import { AggregationShape } from './AggregationShape';
import { AggregationEditor } from './AggregationEditor';

import icon from './aggregation.png';

const AggregationReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel<AggregationDSL>(props.node).properties;

  if (properties == null) {
    return null;
  }

  return <AggregationShape dsl={properties} />;
};

registerReactComponent(DomainObjectName.Aggregation, AggregationReactShapeComponent);

export const AggregationShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={DomainObjectName.Aggregation} />;
};

const ALLOWED_CHILD = new Set<string>([DomainObjectName.Entity, DomainObjectName.ValueObject, DomainObjectName.Enum]);

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
  autoResizeGroup: { padding: 60, minHeight: 500, minWidth: 500 },
  embeddable(ctx) {
    const { childModel } = ctx;
    return !!(childModel && ALLOWED_CHILD.has(childModel.name));
  },
  droppable(ctx) {
    const { sourceType } = ctx;
    return ALLOWED_CHILD.has(sourceType);
  },
  rules: {
    fields: {
      [ROOT_FIELD]: {
        $self: [
          {
            // 聚合根检查
            async validator(value, context) {
              const object = getDomainObjectFromValidatorContext(context) as DomainObjectAggregation;
              if (object.aggregationRoots.length === 0) {
                throw new Error('未配置聚合根');
              } else if (object.aggregationRoots.length > 1) {
                throw new Error('有且只有一个聚合根');
              }
            },
            reportType: FormRuleReportType.Error,
          },
        ],
      },
      name: {
        $self: [
          { required: true, message: '标识符不能为空' },
          {
            async validator(value, context) {
              // 检查命名是否冲突
              checkDomainObjectNameConflict(value, context);
            },
          },
        ],
      },
      title: { $self: [{ required: true, reportType: FormRuleReportType.Warning, message: '请填写标题' }] },
    },
  },
  initialProps: () => {
    return { ...createAggregation(), zIndex: 1, size: { width: 500, height: 300 }, __prevent_auto_resize__: true };
  },
  copyFactory({ payload }) {
    return { uuid: payload.id };
  },
  component: AggregationShapeComponent,
  attributeComponent: AggregationEditor,
});
