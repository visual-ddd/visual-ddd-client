import { defineShape, FormRuleReportType, ROOT_FIELD, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import {
  createEnum,
  DomainObjectName,
  EnumDSL,
  EnumShape,
  EnumEditor,
  checkUnderAggregation,
  checkDomainObjectNameConflict,
  checkPropertyName,
  EnumBaseType,
} from '../../dsl';

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

  rules: {
    fields: {
      [ROOT_FIELD]: {
        $self: [
          {
            // 检查是否在聚合下
            async validator(value, context) {
              checkUnderAggregation(context);
            },
            reportType: FormRuleReportType.Warning,
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
      members: {
        $self: { type: 'array' },
        '*': {
          $self: { type: 'object' },
          fields: {
            name: {
              $self: [
                { required: true, message: '成员名不能为空' },
                {
                  async validator(value, context) {
                    checkPropertyName(value, 'members', context);
                  },
                },
              ],
            },
            code: {
              $self: [
                { required: true, message: '编码不能为空' },
                {
                  async validator(value, context) {
                    const baseType = context.model.getProperty('baseType') as EnumBaseType;
                    value = value.trim();

                    if (!value) {
                      throw new Error(`编码不能为空`);
                    }

                    if (baseType === 'number') {
                      if (Number.isNaN(parseFloat(value))) {
                        throw new Error(`编码必须是数字`);
                      }
                    }
                  },
                },
              ],
            },
          },
        },
      },
    },
  },

  initialProps: () => {
    return { ...createEnum(), zIndex: 2 };
  },
  component: EnumShapeComponent,
  attributeComponent: EnumAttributeComponent,
});
