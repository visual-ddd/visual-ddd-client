import { NameDSL, PropertyDSL } from '@/modules/domain/domain-design/dsl';

/**
 * 来源对象
 *
 * 可以是领域对象、DTO
 * 字段类型为 Java
 *
 */
export interface ISourceObject extends NameDSL {
  /**
   * 属性
   */
  properties: PropertyDSL[];
}

export interface ISourceObjectGroup {
  key: string;
  label: string;
  list: ISourceObject[];
}
