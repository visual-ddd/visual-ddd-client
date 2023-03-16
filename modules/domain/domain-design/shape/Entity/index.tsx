import {
  CopyPayload,
  defineShape,
  FormRuleReportType,
  ROOT_FIELD,
  ShapeComponentProps,
  useShapeModel,
} from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';
import { Tooltip } from 'antd';
import type { Node } from '@antv/x6';
import { QuestionCircleFilled } from '@ant-design/icons';
import { getPrefixPath } from '@/lib/utils';

import {
  ClassShape,
  createEntity,
  EntityDSL,
  DomainObjectName,
  checkDomainObjectNameConflict,
  checkPropertyName,
  checkUnderPackage,
  checkSameAggregationReference,
  checkReferenceError,
  checkAggregationRootReference,
  DomainObjectReadableName,
} from '../../dsl';
import { DomainEditorModel } from '../../model';

import { EntityEditor } from './EntityEditor';

import icon from './entity.png';
import { createDomainObjectTransform, TRANSFORM_TARGET } from '../../transform';

const EntityReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel<EntityDSL>(props.node).properties;

  if (properties == null) {
    return null;
  }

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
  copyFactory({ payload }) {
    return { uuid: payload.id };
  },
  contextMenu: [
    {
      key: 'generator',
      label: (
        <span>
          自动生成对象
          <Tooltip title="自动根据聚合根生成查询、数据对象、数据映射" placement="right">
            <QuestionCircleFilled className="u-ml-xs u-gray-500" />
          </Tooltip>
        </span>
      ),
      visible: ({ canvasModel, target }) => {
        return !canvasModel.readonly && (target?.model.properties as unknown as EntityDSL).isAggregationRoot;
      },
      handler(context) {
        const { canvasModel, target } = context;
        if (!target) {
          return;
        }
        (canvasModel.editorModel as DomainEditorModel).domainGenerator?.domainGenerate(
          target.model.properties as unknown as EntityDSL
        );
      },
    },
    {
      key: 'transform',
      label: '复制为',
      children: TRANSFORM_TARGET.map(([name, method]) => {
        return {
          key: name,
          label: DomainObjectReadableName[name],
          handler: context => {
            const { model, cell } = context.target!;
            const transform = createDomainObjectTransform(DomainObjectName.Entity, model.properties as any);
            const dsl = transform[method]();

            const payload: CopyPayload = {
              id: dsl.uuid,
              type: 'node',
              size: (cell as Node).getSize(),
              position: { x: 0, y: 0 },
              properties: {
                ...dsl,
                __node_name__: name,
                __node_type__: 'node',
              },
            };

            context.canvasModel.handleCopyPayloads([payload]);
          },
        };
      }),
    },
  ],
  component: EntityShapeComponent,
  attributeComponent: EntityAttributesComponent,
});
