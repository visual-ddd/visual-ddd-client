import { cloneDeep } from '@wakeapp/utils';
import { TypeDSL, TypeType, ReferenceTypeDSL, ContainerTypeDSL } from '../domain-design/dsl/dsl';
import { DomainObjectName } from '../domain-design/dsl/constants';
import { DataObjectTypeDSL, DataObjectTypeName } from '../data-design/dsl/dsl';
import { BaseTypeCompatibleMap } from '../mapper-design/dsl/compatible';

import { IDomainObjectStore } from './types';

export function transformTypeDSLReference(type: TypeDSL, transform: (type: ReferenceTypeDSL) => TypeDSL): TypeDSL {
  switch (type.type) {
    case TypeType.Base:
      return cloneDeep(type);
    case TypeType.Container:
      return {
        ...type,
        params: Object.keys(type.params).reduce((acc, key) => {
          const currentValue = type.params[key];
          acc[key] = currentValue && transformTypeDSLReference(currentValue, transform);
          return acc;
        }, {} as ContainerTypeDSL['params']),
      };
    case TypeType.Reference:
      return transform(type);
  }
}

/**
 * 转换 领域对象类型 到 数据模型类型
 * 目前仅支持基础类型 和 枚举
 * @param type
 * @returns
 */
export function transformTypeDSLToDataObjectTypeDSL(
  type: TypeDSL,
  getObjectById?: IDomainObjectStore['getObjectById']
): DataObjectTypeDSL | undefined {
  switch (type.type) {
    case TypeType.Base:
      const compatibleType = BaseTypeCompatibleMap[type.name][0] || DataObjectTypeName.String;

      return {
        type: compatibleType,
      };
    case TypeType.Reference: {
      const obj = getObjectById?.(type.referenceId);

      if (obj?.type === DomainObjectName.Enum) {
        return {
          type: obj.value.baseType === 'number' ? DataObjectTypeName.Integer : DataObjectTypeName.String,
        };
      }
    }
    default:
      return undefined;
  }
}
