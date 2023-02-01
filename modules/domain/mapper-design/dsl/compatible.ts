import { DataObjectTypeDSL, DataObjectTypeName } from '../../data-design/dsl';
import { BaseType, TypeDSL } from '../../domain-design/dsl';

/**
 * 兼容性声明
 */
export type SourceFieldType = TypeDSL;
export type TargetFieldType = DataObjectTypeDSL;

export const BaseTypeCompatibleMap: Record<BaseType, DataObjectTypeName[]> = {
  String: [DataObjectTypeName.String, DataObjectTypeName.Text, DataObjectTypeName.LongText],
  Integer: [DataObjectTypeName.Integer, DataObjectTypeName.Long],
  Long: [DataObjectTypeName.Long],
  Double: [DataObjectTypeName.Double],
  Float: [DataObjectTypeName.Float, DataObjectTypeName.Double],
  Date: [DataObjectTypeName.DateTime, DataObjectTypeName.Date, DataObjectTypeName.Timestamp],
  Boolean: [DataObjectTypeName.Boolean, DataObjectTypeName.Integer],
  BigDecimal: [DataObjectTypeName.Decimal],
  Char: [DataObjectTypeName.Integer],
  Byte: [DataObjectTypeName.Integer],
  Short: [DataObjectTypeName.Integer],
  Void: [],
};

/**
 * 兼容性检查
 * @param source
 * @param target
 * @returns
 */
export function isCompatible(source: SourceFieldType, target: TargetFieldType): boolean {
  if (source.type === 'base') {
    return BaseTypeCompatibleMap[source.name].includes(target.type);
  } else if (target.type === DataObjectTypeName.JSON) {
    // 对象类型、集合类型支持转换为 JSON
    return true;
  }

  return false;
}
