import { createNameDSL, createIDDSL } from '@/modules/domain/domain-design/dsl/factory';

import { FieldMapperDSL, MapperObjectDSL, NameDSL } from './dsl';

/**
 * 创建映射名称
 * @param from
 * @param to
 */
export function createMapperName(from: NameDSL, to: NameDSL) {
  return `${from.name}To${to.name}`;
}

/**
 * 创建映射的标题
 * @param from
 * @param to
 * @returns
 */
export function createMapperTitle(from: NameDSL, to: NameDSL) {
  return `${from.title} 到 ${to.title} 的映射`;
}

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
