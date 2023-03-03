import { defineShape, FormRuleReportType, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import {
  checkDomainObjectNameConflict,
  checkPropertyName,
  checkReferenceError,
  ClassShape,
  createDTO,
  DomainObjectName,
  DTODSL,
  DTOEditor,
} from '../../dsl';

import icon from './dto.png';

const DTOReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel<DTODSL>(props.node).properties;

  if (properties == null) {
    return null;
  }

  return <ClassShape dsl={properties} type="DTO" style={{ backgroundColor: '#f0f0f0' }} />;
};

registerReactComponent(DomainObjectName.DTO, DTOReactShapeComponent);

const DTOShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={DomainObjectName.DTO} />;
};

const DTOAttributeComponent = () => {
  return <DTOEditor />;
};

/**
 * 实体
 */
defineShape({
  name: DomainObjectName.DTO,
  title: 'DTO',
  description: 'DTO',
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

  initialProps: () => {
    return { ...createDTO(), zIndex: 2 };
  },
  copyFactory({ payload }) {
    return { uuid: payload.id };
  },
  component: DTOShapeComponent,
  attributeComponent: DTOAttributeComponent,
});
