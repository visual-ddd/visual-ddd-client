import { defineShape, FormRuleReportType, ROOT_FIELD, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';
import { getPrefixPath } from '@/lib/utils';

import {
  checkAggregationRootReference,
  checkDomainObjectNameConflict,
  checkPropertyName,
  checkReferenceError,
  checkSameAggregationReference,
  checkUnderPackage,
  ClassShape,
  createValueObject,
  DomainObjectName,
  ValueObjectDSL,
} from '../../dsl';
import { createCopyAsMenu } from '@/modules/domain/transform';

import { ValueObjectEditor } from './ValueObjectEditor';

import icon from './value-object.png';

const ValueObjectReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel<ValueObjectDSL>(props.node).properties;

  if (properties == null) {
    return null;
  }

  return <ClassShape dsl={properties} type="值对象" style={{ backgroundColor: '#BAE7FF' }} />;
};

registerReactComponent(DomainObjectName.ValueObject, ValueObjectReactShapeComponent);

const ValueObjectShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={DomainObjectName.ValueObject} />;
};

const ValueObjectAttributeComponent = () => {
  return <ValueObjectEditor />;
};

/**
 * 实体
 */
defineShape({
  name: DomainObjectName.ValueObject,
  title: '值对象',
  description: '值对象',
  icon: icon,
  shapeType: 'node',

  rules: {
    fields: {
      [ROOT_FIELD]: {
        $self: [
          {
            // 检查是否在聚合下
            async validator(value, context) {
              checkUnderPackage(context);
            },
            reportType: FormRuleReportType.Warning,
          },
          {
            // 检查引用
            async validator(value, context) {
              checkSameAggregationReference(context);
              checkReferenceError(context);
              checkAggregationRootReference(context);
            },
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
      properties: {
        $self: { type: 'array' },
        '*': {
          $self: { type: 'object' },
          fields: {
            name: {
              $self: [
                { required: true, message: '属性名不能为空' },
                {
                  async validator(value, context) {
                    checkPropertyName(value, 'properties', context);
                  },
                },
              ],
            },
          },
        },
      },
      methods: {
        $self: { type: 'array' },
        '*': {
          $self: { type: 'object' },
          fields: {
            name: {
              $self: [
                { required: true, message: '方法名不能为空' },
                {
                  async validator(value, context) {
                    checkPropertyName(value, 'methods', context);
                  },
                },
              ],
            },
            parameters: {
              $self: { type: 'array' },
              '*': {
                $self: { type: 'object' },
                fields: {
                  name: {
                    $self: [
                      { required: true, message: '参数名不能为空' },
                      {
                        async validator(value, context) {
                          checkPropertyName(value, getPrefixPath(context.rawRule.fullField!, 'parameters'), context);
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  contextMenu: [createCopyAsMenu(DomainObjectName.ValueObject)],

  initialProps: () => {
    return { ...createValueObject(), zIndex: 2 };
  },
  copyFactory({ payload }) {
    return { uuid: payload.id };
  },
  component: ValueObjectShapeComponent,
  attributeComponent: ValueObjectAttributeComponent,
});
