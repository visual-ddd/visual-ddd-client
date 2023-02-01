import { createNameDSL } from '@/modules/domain/domain-design/dsl';
import { v4 } from 'uuid';

import { FieldMapperDSL, MapperObjectDSL } from './dsl';

export function createFieldMapperDSL(): FieldMapperDSL {
  return {
    source: undefined,
    target: undefined,
    uuid: v4(),
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
