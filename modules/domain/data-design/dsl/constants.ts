import { DataObjectIndexMethod, DataObjectIndexType, DataObjectReferenceCardinality, DataObjectTypeName } from './dsl';

export enum DataObjectName {
  DataObject = 'dataObject',
}

export const DataObjectReadableName: Record<DataObjectName, string> = {
  [DataObjectName.DataObject]: '数据对象',
};

export const DataObjectTypeList: { name: DataObjectTypeName; label: string }[] = [
  { name: DataObjectTypeName.Boolean, label: '布尔型' },
  { name: DataObjectTypeName.Integer, label: '整型' },
  { name: DataObjectTypeName.Decimal, label: '十进制' },
  { name: DataObjectTypeName.Long, label: '长整型' },
  { name: DataObjectTypeName.Double, label: '双精度' },
  { name: DataObjectTypeName.Float, label: '浮点型' },
  { name: DataObjectTypeName.Date, label: '日期型' },
  { name: DataObjectTypeName.DateTime, label: '日期时间型' },
  { name: DataObjectTypeName.Timestamp, label: '时间戳型' },
  { name: DataObjectTypeName.String, label: '字符串' },
  { name: DataObjectTypeName.Text, label: '文本型' },
  { name: DataObjectTypeName.LongText, label: '长文本型' },
  { name: DataObjectTypeName.JSON, label: 'JSON型' },
  { name: DataObjectTypeName.Reference, label: '引用型' },
];

export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const DataObjectIndexTypeName: Record<DataObjectIndexType, string> = {
  [DataObjectIndexType.Normal]: '普通索引',
  [DataObjectIndexType.Unique]: '唯一索引',
  [DataObjectIndexType.FullText]: '全文索引',
};

export const DataObjectIndexListList: { name: DataObjectIndexType; label: string }[] = [
  { name: DataObjectIndexType.Normal, label: DataObjectIndexTypeName[DataObjectIndexType.Normal] },
  { name: DataObjectIndexType.Unique, label: DataObjectIndexTypeName[DataObjectIndexType.Unique] },
  { name: DataObjectIndexType.FullText, label: DataObjectIndexTypeName[DataObjectIndexType.FullText] },
];

export const DataObjectIndexMethodList: { name: DataObjectIndexMethod; label: string }[] = [
  { name: DataObjectIndexMethod.BTREE, label: 'BTREE' },
  { name: DataObjectIndexMethod.HASH, label: 'HASH' },
];

/**
 * 支持主键的字段类型
 * @param type
 * @returns
 */
export function objectTypeThatSupportPrimaryKey(type: DataObjectTypeName) {
  return type !== DataObjectTypeName.JSON;
}

/**
 * 支持默认值的字段类型
 * @param type
 * @returns
 */
export function objectTypeThatSupportDefaultValue(type: DataObjectTypeName) {
  return (
    type === DataObjectTypeName.Boolean ||
    type === DataObjectTypeName.Integer ||
    type === DataObjectTypeName.Decimal ||
    type === DataObjectTypeName.Long ||
    type === DataObjectTypeName.Double ||
    type === DataObjectTypeName.Float ||
    type === DataObjectTypeName.Date ||
    type === DataObjectTypeName.DateTime ||
    type === DataObjectTypeName.Timestamp ||
    type === DataObjectTypeName.String
  );
}

/**
 * 反方向基数
 */
export const DataObjectReferenceCardinalityReversed: Record<
  DataObjectReferenceCardinality,
  DataObjectReferenceCardinality
> = {
  [DataObjectReferenceCardinality.ManyToMany]: DataObjectReferenceCardinality.ManyToMany,
  [DataObjectReferenceCardinality.OneToOne]: DataObjectReferenceCardinality.OneToOne,
  [DataObjectReferenceCardinality.OneToMany]: DataObjectReferenceCardinality.ManyToOne,
  [DataObjectReferenceCardinality.ManyToOne]: DataObjectReferenceCardinality.OneToMany,
};

/**
 * 可被引用的字段类型
 * @param type
 * @returns
 */
export function objectTypeThatReferable(type: DataObjectTypeName) {
  return type !== DataObjectTypeName.Reference && type !== DataObjectTypeName.JSON;
}

/**
 * 支持递增的字段类型
 * @param type
 * @returns
 */
export function objectTypeThatSupportAutoIncrement(type: DataObjectTypeName) {
  return (
    type === DataObjectTypeName.Integer ||
    type === DataObjectTypeName.Long ||
    type === DataObjectTypeName.Double ||
    type === DataObjectTypeName.Float
  );
}

export function objectTypeThatSupportLength(type: DataObjectTypeName) {
  return type === DataObjectTypeName.String;
}
