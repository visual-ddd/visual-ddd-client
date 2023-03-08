import { DataObjectTypeDSL, DataObjectTypeName } from '../../data-design/dsl';
import { BaseType, TypeDSL, TypeType } from '../../domain-design/dsl/dsl';

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
export function isCompatible(
  source: SourceFieldType,
  target: TargetFieldType,
  inject: {
    getReferenceStorageType: (id: string) => TypeDSL | undefined;
  }
): boolean {
  const { getReferenceStorageType } = inject;

  if (source.type === TypeType.Reference) {
    // 获取底层的存储数据, 比如美剧
    const storageType = getReferenceStorageType(source.referenceId);
    if (!storageType) {
      return false;
    }

    source = storageType;
  }

  if (source.type === TypeType.Base) {
    return BaseTypeCompatibleMap[source.name].includes(target.type);
  }

  if (target.type === DataObjectTypeName.JSON) {
    // 对象类型、集合类型支持转换为 JSON
    return true;
  }

  return false;
}
