import { IDDSL, NameDSL, ReferenceDSL } from '@/modules/domain/domain-design/dsl/dsl';

export interface ObjectReferenceDSL extends ReferenceDSL {
  source?: string;
}

export interface FieldMapperDSL extends IDDSL {
  /**
   * 来源字段, 必填
   */
  source?: string;

  /**
   * 目标字段，必填
   */
  target?: string;
}

/**
 * 对象结构映射
 */
export interface MapperObjectDSL extends NameDSL {
  /**
   * 来源对象, 领域对象或DTO
   * 必填
   */
  source?: ObjectReferenceDSL;

  /**
   * 目标对象, 数据模型
   * 必填
   */
  target?: ObjectReferenceDSL;

  /**
   * 字段映射
   */
  mappers: FieldMapperDSL[];
}
