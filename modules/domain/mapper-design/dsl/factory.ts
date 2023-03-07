import { createNameDSL, createIDDSL } from '@/modules/domain/domain-design/dsl/factory';

import { FieldMapperDSL, MapperObjectDSL } from './dsl';

export function createFieldMapperDSL(): FieldMapperDSL {
  return {
    ...createIDDSL(),
    source: undefined,
    target: undefined,
  };
}

/**
 * 创建对象结构映射
 */
export function createObjectMapperDSL(): MapperObjectDSL {
  return {
    ...createNameDSL({}),
    source: undefined,
    target: undefined,
    mappers: [],
  };
}
