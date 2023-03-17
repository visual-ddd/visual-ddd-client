import { defineShape, FormRuleReportType, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import {
  DomainObjectName,
  createQuery,
  QueryDSL,
  ClassShape,
  ClassDSL,
  checkDomainObjectNameConflict,
  checkPropertyName,
  checkReferenceError,
} from '../../dsl';

import { QueryEditor } from './QueryEditor';

import icon from './query.png';
import { createCopyAsMenu } from '@/modules/domain/transform';

const QueryReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel<QueryDSL>(props.node).properties;

  if (properties == null) {
    return null;
  }

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
  rules: {
    fields: {
      name: {
        $self: [
          { required: true, message: '标识符不能为空' },
          {
            async validator(value, context) {
              // 检查命名是否冲突
              checkDomainObjectNameConflict(value, context);
              checkReferenceError(context);
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
    },
  },
  contextMenu: [createCopyAsMenu(DomainObjectName.Query)],
  initialProps: () => {
    return { ...createQuery(), zIndex: 2 };
  },
  copyFactory({ payload }) {
    return { uuid: payload.id };
  },
  component: QueryShapeComponent,
  attributeComponent: QueryAttributeComponent,
});
