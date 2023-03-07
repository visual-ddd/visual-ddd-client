import { DTODSL, NameDSL, TypeDSL } from '../domain-design/dsl/dsl';

export * from './public-types';

type SourceObjectUUID = string;

/**
 * 缓存转换的结果
 */
export interface IGeneratorState<T extends NameDSL> {
  /**
   * 已转换的结果
   */
  list: T[];

  /**
   * 已转换的结果
   */
  results: Map<SourceObjectUUID, T>;

  save(uuid: string, result: T): void;
  get(uuid: string): T | undefined;
}

export type DTOGeneratorState = IGeneratorState<DTODSL>;

/**
 * 查询模型 TypeDSL 转换器
 */
export interface IQueryTypeDSLTransformer {
  transformQueryTypeDSL(type: TypeDSL): TypeDSL;
}
