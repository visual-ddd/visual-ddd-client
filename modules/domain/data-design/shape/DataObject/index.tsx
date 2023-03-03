import { defineShape, FormRuleReportType, ROOT_FIELD, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';
import { createDataObjectDSL, DataObjectDSL, DataObjectName, DataObjectTypeName } from '../../dsl';
import { DataObjectEditor } from './DataObjectEditor';
import { DataObjectShape } from './DataObjectShape';
import icon from './data-object.png';
import {
  checkDataObjectNameConflict,
  checkReferenceError,
  getDataObjectFromValidatorContext,
  getDataObjectStoreFromFormValidatorContext,
  getDataObjectType,
} from './validator';
import { checkPropertyName } from '@/modules/domain/domain-design/dsl/validators';

const DataObjectReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel<DataObjectDSL>(props.node).properties;

  if (properties == null) {
    return null;
  }

  return <DataObjectShape dsl={properties}></DataObjectShape>;
};

registerReactComponent(DataObjectName.DataObject, DataObjectReactShapeComponent);

const DataObjectShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={DataObjectName.DataObject} />;
};

const DataObjectAttributeComponent = () => {
  return <DataObjectEditor />;
};

defineShape({
  name: DataObjectName.DataObject,
  title: '数据对象',
  description: '数据对象建模',
  shapeType: 'node',
  icon,
  rules: {
    fields: {
      [ROOT_FIELD]: {
        $self: [
          {
            // 检查引用
            async validator(value, context) {
              checkReferenceError(context);
            },
          },
        ],
      },
      name: {
        $self: [
          { required: true, message: '标识符不能为空' },
          {
            async validator(value, context) {
              // 检查命名冲突
              checkDataObjectNameConflict(value, context);
            },
          },
        ],
      },
      title: { $self: [{ required: true, reportType: FormRuleReportType.Warning, message: '请填写标题' }] },
      tableName: {
        $self: {
          async validator(value, context) {
            if (!value) {
              return;
            }
            checkDataObjectNameConflict(value, context, 'tableName', '表名');
          },
        },
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
            propertyName: {
              $self: [
                {
                  async validator(value, context) {
                    if (value == null || !(value as string).trim()) {
                      return;
                    }

                    checkPropertyName(value, 'properties', context);
                  },
                },
              ],
            },
            type: {
              $self: { type: 'object' },
              fields: {
                type: {
                  $self: [{ required: true, message: '请选择类型' }],
                },
                target: {
                  $self: {
                    async validator(value, context) {
                      const type = getDataObjectType(context);

                      if (type.type !== DataObjectTypeName.Reference) {
                        return;
                      }

                      if (!value) {
                        throw new Error(`请选择引用类型`);
                      }

                      // 引用对象是否存在
                      const store = getDataObjectStoreFromFormValidatorContext(context);
                      if (!store.getObjectById(value)) {
                        throw new Error(`引用对象不存在`);
                      }
                    },
                  },
                },
                targetProperty: {
                  $self: {
                    async validator(value, context) {
                      const type = getDataObjectType(context);

                      if (type.type !== DataObjectTypeName.Reference) {
                        return;
                      }

                      const targetId = type.target;
                      if (!targetId) {
                        return;
                      }

                      const store = getDataObjectStoreFromFormValidatorContext(context);
                      const target = store.getObjectById(targetId);

                      if (!target) {
                        return;
                      }

                      if (!value) {
                        throw new Error(`请选择引用字段`);
                      }

                      // 引用字段是否存在
                      const field = target.getPropertyById(value);
                      if (field == null) {
                        throw new Error(`引用字段不存在`);
                      }

                      if (field.type.type === DataObjectTypeName.Reference) {
                        throw new Error(`被引用的字段不能为引用类型`);
                      }
                    },
                  },
                },
              },
            },
          },
        },
      },
      indexes: {
        $self: { type: 'array' },
        '*': {
          $self: { type: 'object' },
          fields: {
            name: {
              $self: [
                { required: true, message: '索引名不能为空' },
                {
                  async validator(value, context) {
                    checkPropertyName(value, 'indexes', context);
                  },
                },
              ],
            },
            properties: {
              $self: [
                {
                  type: 'array',
                  required: true,
                  message: '索引属性不能为空',
                },
                {
                  async validator(value: string[], context) {
                    if (!value?.length) {
                      return;
                    }

                    // 检查属性是否存在
                    const object = getDataObjectFromValidatorContext(context);
                    if (!object) {
                      return;
                    }

                    for (const id of value) {
                      if (!object.getPropertyById(id)) {
                        throw new Error(`索引字段不存在`);
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
  initialProps() {
    return {
      ...createDataObjectDSL(),
      zIndex: 2,
    };
  },
  copyFactory({ payload }) {
    return { uuid: payload.id };
  },
  component: DataObjectShapeComponent,
  attributeComponent: DataObjectAttributeComponent,
});
