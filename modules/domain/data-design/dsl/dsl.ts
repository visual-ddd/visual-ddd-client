import { NameDSL } from '@/modules/domain/domain-design/dsl/dsl';

/**
 * 类型
 */
export enum DataObjectTypeName {
  Boolean = 'Boolean',
  Date = 'Date',
  DateTime = 'DateTime',
  Timestamp = 'Timestamp',
  Integer = 'Integer',
  Decimal = 'Decimal',
  Long = 'Long',
  Double = 'Double',
  Float = 'Float',
  String = 'String',
  Text = 'Text',
  LongText = 'LongText',
  JSON = 'JSON',
  Reference = 'Reference',
}

/**
 * 布尔值
 */
export type DataObjectBoolean = {
  type: DataObjectTypeName.Boolean;
  defaultValue?: boolean;
};

/**
 * 日期
 */
export type DataObjectDate = {
  type: DataObjectTypeName.Date;
  defaultValue?: `${number}-${number}-${number}`;
};

/**
 * 日期时间
 */
export type DataObjectDateTime = {
  type: DataObjectTypeName.DateTime;
  defaultValue?: `${number}-${number}-${number} ${number}:${number}:${number}`;
};

/**
 * 时间戳
 */
export type DataObjectTimestamp = {
  type: DataObjectTypeName.Timestamp;
  /**
   * 从 1970-01-01 00:00:00 开始的时间戳
   */
  defaultValue?: `${number}-${number}-${number} ${number}:${number}:${number}`;
};

/**
 * 整数
 */
export type DataObjectInteger = {
  type: DataObjectTypeName.Integer;
  defaultValue?: number;

  /**
   * 是否自增
   */
  autoIncrement?: boolean;
};

/**
 * 小数
 */
export type DataObjectDecimal = {
  type: DataObjectTypeName.Decimal;
  defaultValue?: number;

  /**
   * 精度, 默认 10, 最大为 65
   */
  precision?: number;

  /**
   * 小数位, 默认 0
   */
  scale?: number;
};

/**
 * 长整型
 */
export type DataObjectLong = {
  type: DataObjectTypeName.Long;
  defaultValue?: number;

  /**
   * 是否自增
   */
  autoIncrement?: boolean;
};

/**
 * Double
 */
export type DataObjectDouble = {
  type: DataObjectTypeName.Double;
  defaultValue?: number;

  /**
   * 是否自增
   */
  autoIncrement?: boolean;
};

/**
 * Float
 */
export type DataObjectFloat = {
  type: DataObjectTypeName.Float;
  defaultValue?: number;

  /**
   * 是否自增
   */
  autoIncrement?: boolean;
};

/**
 * String
 */
export type DataObjectString = {
  type: DataObjectTypeName.String;
  defaultValue?: string;

  /**
   * 对应 varchar
   * 0 to 65,535.
   * 默认 255
   */
  length?: number;
};

/**
 * Text
 */
export type DataObjectText = {
  type: DataObjectTypeName.Text;
};

/**
 * 长文本
 */
export type DataObjectLongText = {
  type: DataObjectTypeName.LongText;
};

export enum DataObjectReferenceCardinality {
  OneToOne = 'OneToOne',
  OneToMany = 'OneToMany',
  ManyToOne = 'ManyToOne',
  ManyToMany = 'ManyToMany',
}

/**
 * 字段引用
 */
export type DataObjectReference = {
  type: DataObjectTypeName.Reference;

  /**
   * 目标对象 ID
   */
  target?: string;

  /**
   * 目标对象字段 ID
   */
  targetProperty?: string;

  /**
   * 基数关系
   */
  cardinality?: DataObjectReferenceCardinality;
};

export type DataObjectJSON = {
  type: DataObjectTypeName.JSON;
};

/**
 * 所有支持的数据类型
 */
export type DataObjectTypeDSL =
  | DataObjectBoolean
  | DataObjectDate
  | DataObjectDateTime
  | DataObjectTimestamp
  | DataObjectInteger
  | DataObjectDecimal
  | DataObjectLong
  | DataObjectDouble
  | DataObjectFloat
  | DataObjectString
  | DataObjectText
  | DataObjectLongText
  | DataObjectJSON
  | DataObjectReference;

/**
 * 数据对象字段
 */
export interface DataObjectPropertyDSL<T extends DataObjectTypeDSL = DataObjectTypeDSL> extends NameDSL {
  /**
   * 表字段名，默认为 name 的 kebab_case 模式
   */
  propertyName?: string;

  /**
   * 字段类型
   */
  type: T;

  /**
   * 是否非空
   */
  notNull?: boolean;

  /**
   * 是否为主键
   */
  primaryKey?: boolean;
}

export enum DataObjectIndexType {
  Normal = 'Normal',
  Unique = 'Unique',
  // PrimaryKey = 'Primary',
  FullText = 'FullText',
}

export enum DataObjectIndexMethod {
  BTREE = 'BTREE',
  HASH = 'HASH',
}

/**
 * 索引描述
 */
export interface DataObjectIndexDSL extends NameDSL {
  /**
   * 索引类型
   */
  type: DataObjectIndexType;

  /**
   * 索引字段
   */
  properties: string[];

  /**
   * 索引方法
   */
  method: DataObjectIndexMethod;
}

/**
 * 数据对象
 */
export interface DataObjectDSL extends NameDSL {
  /**
   * 表名称，默认为 name 的 kebab_case 模式
   */
  tableName?: string;

  /**
   * 字段
   */
  properties: DataObjectPropertyDSL[];

  /**
   * 索引
   */
  indexes: DataObjectIndexDSL[];
}
