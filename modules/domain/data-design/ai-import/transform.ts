import { AIImport } from './dsl';
import { DataObjectDSL, DataObjectReference, DataObjectTypeName } from '../dsl/dsl';
import { createDataObjectDSL, createDataObjectPropertyDSL, createDataObjectType } from '../dsl/factory';
import { assert } from '@/lib/utils';

function isReference(
  type: AIImport.DataObjectNormalType | AIImport.DataObjectReferenceType
): type is AIImport.DataObjectReferenceType {
  return type.type === DataObjectTypeName.Reference;
}

export function transform(data: AIImport.DataObject[]): DataObjectDSL[] {
  const pending: Function[] = [];
  const list: DataObjectDSL[] = [];

  for (const item of data) {
    const object = createDataObjectDSL();
    object.title = item.title;
    object.name = item.name;
    object.properties = [];

    for (const prop of item.properties) {
      const property = createDataObjectPropertyDSL();
      property.name = prop.name;
      property.title = prop.title;

      if (prop.primaryKey) {
        property.notNull = true;
        property.primaryKey = true;
      }

      property.type = createDataObjectType(prop.type.type ?? DataObjectTypeName.String);

      if (isReference(prop.type)) {
        const type = prop.type;
        pending.push(() => {
          const obj = list.find(i => i.name === type.target);
          assert(obj, `引用类型解析错误, 未找到对象 ${type.target}`);

          const field = obj.properties.find(i => i.name === type.property);

          assert(field, `引用类型解析错误, 未找到字段 ${type.target}.${type.property}`);

          const ref = property.type as DataObjectReference;
          ref.target = obj.uuid;
          ref.targetProperty = field.uuid;
          ref.cardinality = type.cardinality;
        });
      }

      object.properties.push(property);
    }

    list.push(object);
  }

  for (const fn of pending) {
    fn();
  }

  return list;
}
