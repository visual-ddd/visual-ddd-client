import { defineShape, FormRuleReportType, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { createObjectMapperDSL, MapperObjectDSL, MapperObjectName } from '../../dsl';

import { MapperObjectEditor } from './Editor';
import { MapperShape } from './Shape';
import icon from './mapper.png';
import {
  checkMapperNameConflict,
  checkSourceField,
  checkSourceObject,
  checkSourceObjectMatch,
  checkTargetField,
  checkTargetObject,
  checkTargetObjectMatch,
} from './validator';

const MapperReactShapeComponent = (props: ReactComponentProps) => {
  const { properties, model } = useShapeModel<MapperObjectDSL>(props.node);

  if (model == null) {
    return null;
  }

  return <MapperShape model={model} dsl={properties!} />;
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
  rules: {
    fields: {
      name: {
        $self: [
          { required: true, message: '标识符不能为空' },
          {
            async validator(value, context) {
              // 检查命名冲突
              checkMapperNameConflict(value, context);
            },
          },
        ],
      },
      source: {
        $self: [
          { type: 'object', required: true, message: '来源对象不能为空' },
          {
            // 验证对象是否存在
            async validator(value, context) {
              checkSourceObject(context);
            },
          },
          {
            reportType: FormRuleReportType.Tip,
            // 提示是否有未匹配的字段
            async validator(value, context) {
              checkSourceObjectMatch(context);
            },
          },
        ],
      },
      target: {
        $self: [
          { type: 'object', required: true, message: '目标对象不能为空' },
          {
            // 验证对象是否存在
            async validator(value, context) {
              checkTargetObject(context);
            },
          },
          {
            reportType: FormRuleReportType.Tip,
            // 提示是否有未匹配的字段
            async validator(value, context) {
              checkTargetObjectMatch(context);
            },
          },
        ],
      },
      mappers: {
        $self: { type: 'array' },
        '*': {
          $self: [
            {
              type: 'object',
            },
          ],
          fields: {
            source: {
              $self: {
                async validator(value, context) {
                  checkSourceField(value, context);
                },
              },
            },
            target: {
              $self: {
                async validator(value, context) {
                  checkTargetField(value, context);
                },
              },
            },
          },
        },
      },
    },
  },
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
