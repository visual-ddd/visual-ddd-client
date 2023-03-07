import { EntityDSL } from '../domain-design/dsl/dsl';
import { FromAggregationRootDSLGenerator } from './FromAggregationRootDSLGenerator';
import { IDomainObjectStore } from './public-types';

export * from './public-types';

/**
 * 领域对象生成器
 * @param params
 * @returns
 */
export function domainObjectGenerate(params: { aggregationRoot: EntityDSL; domainObjectStore: IDomainObjectStore }) {
  const { aggregationRoot, domainObjectStore } = params;
  const gen = new FromAggregationRootDSLGenerator({
    entity: aggregationRoot,
    domainObjectStore,
  });

  return gen.generate();
}
