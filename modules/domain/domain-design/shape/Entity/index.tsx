import { defineShape, FormRuleReportType, ROOT_FIELD, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import {
  ClassShape,
  createEntity,
  EntityEditor,
  EntityDSL,
  DomainObjectName,
  checkDomainObjectNameConflict,
  checkPropertyName,
  checkUnderPackage,
  checkSameAggregationReference,
} from '../../dsl';
import { getPrefixPath } from '@/lib/utils';

import icon from './entity.png';

const EntityReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel(props.node).properties as unknown as EntityDSL;

  return (
    <ClassShape
      dsl={properties}
      type={properties.isAggregationRoot ? '聚合根' : '实体'}
      style={{ backgroundColor: '#d9f7be' }}
    />
  );
};

registerReactComponent(DomainObjectName.Entity, EntityReactShapeComponent);

const EntityShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={DomainObjectName.Entity} />;
};

const EntityAttributesComponent = () => {
  return <EntityEditor />;
};

/**
 * 实体
 */
defineShape({
  name: DomainObjectName.Entity,
  title: '实体',
  description: '领域实体',
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
      id: {
        $self: [
          { required: true, message: '实体必须设置唯一标识符属性' },
          {
            async validator(value, context) {
              const { model } = context;
              const dsl = model.properties as unknown as EntityDSL;
              const properties = dsl.properties;

              if (!properties.some(i => i.uuid === value)) {
                throw new Error(`实体必须设置唯一标识符属性, 请检查配置是否正确`);
              }
            },
          },
        ],
      },
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
  initialProps: () => {
    return { ...createEntity(), zIndex: 2 };
  },
  component: EntityShapeComponent,
  attributeComponent: EntityAttributesComponent,
});
