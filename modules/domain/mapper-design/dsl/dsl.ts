import { IDDSL, NameDSL, ReferenceDSL } from '@/modules/domain/domain-design/dsl/dsl';

export interface FieldMapperDSL extends IDDSL {
  /**
   * 来源字段, 必填
   */
  source?: ReferenceDSL;

  /**
   * 目标字段，必填
   */
  target?: ReferenceDSL;
}

/**
 * 对象结构映射
 */
export interface MapperObjectDSL extends NameDSL {
  /**
   * 来源对象, 领域对象或DTO
   * 必填
   */
  source?: ReferenceDSL;

  /**
   * 目标对象, 数据模型
   * 必填
   */
  target?: ReferenceDSL;

  /**
   * 字段映射
   */
  mappers: FieldMapperDSL[];
}
