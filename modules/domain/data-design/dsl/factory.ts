import { createNameDSL } from '@/modules/domain/domain-design/dsl/factory';

import {
  DataObjectBoolean,
  DataObjectDate,
  DataObjectDateTime,
  DataObjectDecimal,
  DataObjectDouble,
  DataObjectDSL,
  DataObjectFloat,
  DataObjectIndexDSL,
  DataObjectIndexMethod,
  DataObjectIndexType,
  DataObjectInteger,
  DataObjectLong,
  DataObjectLongText,
  DataObjectPropertyDSL,
  DataObjectReference,
  DataObjectString,
  DataObjectText,
  DataObjectTimestamp,
  DataObjectTypeDSL,
  DataObjectTypeName,
} from './dsl';

export function createDataObjectBoolean(): DataObjectBoolean {
  return {
    type: DataObjectTypeName.Boolean,
    defaultValue: undefined,
  };
}

export function createDataObjectDate(): DataObjectDate {
  return {
    type: DataObjectTypeName.Date,
    defaultValue: undefined,
  };
}

export function createDataObjectDateTime(): DataObjectDateTime {
  return {
    type: DataObjectTypeName.DateTime,
    defaultValue: undefined,
  };
}

export function createDataObjectTimestamp(): DataObjectTimestamp {
  return {
    type: DataObjectTypeName.Timestamp,
    defaultValue: undefined,
  };
}

export function createDataObjectInteger(): DataObjectInteger {
  return {
    type: DataObjectTypeName.Integer,
    defaultValue: undefined,
    autoIncrement: false,
  };
}

export function createDataObjectDecimal(): DataObjectDecimal {
  return {
    type: DataObjectTypeName.Decimal,
    defaultValue: undefined,
    precision: undefined,
    scale: undefined,
  };
}

export function createDataObjectLong(): DataObjectLong {
  return {
    type: DataObjectTypeName.Long,
    defaultValue: undefined,
    autoIncrement: false,
  };
}

export function createDataObjectDouble(): DataObjectDouble {
  return {
    type: DataObjectTypeName.Double,
    defaultValue: undefined,
    autoIncrement: false,
  };
}

export function createDataObjectFloat(): DataObjectFloat {
  return {
    type: DataObjectTypeName.Float,
    defaultValue: undefined,
    autoIncrement: false,
  };
}

export function createDataObjectString(): DataObjectString {
  return {
    type: DataObjectTypeName.String,
    defaultValue: undefined,
    length: undefined,
  };
}

export function createDataObjectText(): DataObjectText {
  return {
    type: DataObjectTypeName.Text,
    defaultValue: undefined,
  };
}

export function createDataObjectLongText(): DataObjectLongText {
  return {
    type: DataObjectTypeName.LongText,
    defaultValue: undefined,
  };
}

export function createDataObjectReference(): DataObjectReference {
  return {
    type: DataObjectTypeName.Reference,
    target: undefined,
    targetProperty: undefined,
    cardinality: undefined,
  };
}

export function createDataObjectType(type: DataObjectTypeName): DataObjectTypeDSL {
  switch (type) {
    case DataObjectTypeName.Boolean:
      return createDataObjectBoolean();
    case DataObjectTypeName.Date:
      return createDataObjectDate();
    case DataObjectTypeName.DateTime:
      return createDataObjectDateTime();
    case DataObjectTypeName.Timestamp:
      return createDataObjectTimestamp();
    case DataObjectTypeName.Integer:
      return createDataObjectInteger();
    case DataObjectTypeName.Decimal:
      return createDataObjectDecimal();
    case DataObjectTypeName.Long:
      return createDataObjectLong();
    case DataObjectTypeName.Double:
      return createDataObjectDouble();
    case DataObjectTypeName.Float:
      return createDataObjectFloat();
    case DataObjectTypeName.String:
      return createDataObjectString();
    case DataObjectTypeName.Text:
      return createDataObjectText();
    case DataObjectTypeName.LongText:
      return createDataObjectLongText();
    case DataObjectTypeName.Reference:
      return createDataObjectReference();
  }
}

/**
 * 创建属性
 * @param type
 * @returns
 */
export function createDataObjectPropertyDSL(
  type: DataObjectTypeName = DataObjectTypeName.String
): DataObjectPropertyDSL {
  return {
    ...createNameDSL({ wordCase: 'camelCase', title: false }),
    propertyName: undefined,
    notNull: false,
    type: createDataObjectType(type),
  };
}

/**
 * 创建索引
 * @returns
 */
export function createDataObjectIndexDSL(): DataObjectIndexDSL {
  return {
    ...createNameDSL({ wordCase: 'camelCase', title: true }),
    type: DataObjectIndexType.Normal,
    properties: [],
    method: DataObjectIndexMethod.BTREE,
  };
}

/**
 * 创建数据对象
 * @returns
 */
export function createDataObjectDSL(): DataObjectDSL {
  const base = createNameDSL({ wordCase: 'CamelCase', title: true });

  return {
    ...base,
    tableName: undefined,
    properties: [createDataObjectPropertyDSL()],
    indexes: [],
  };
}
