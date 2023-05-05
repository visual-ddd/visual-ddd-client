import { derive } from '@/lib/store';
import { booleanPredicate, NoopArray } from '@wakeapp/utils';
import { extraDependenciesFromQuery, QueryDSL } from '../dsl';
import { DomainObject } from './DomainObject';
import { DomainObjectFactory } from './DomainObjectFactory';
import { DomainObjectRule } from './DomainObjectRule';
import { toTypescriptInteface } from './toTypescriptInterface';

/**
 * 命令对象
 */
export class DomainObjectQuery extends DomainObject<QueryDSL> {
  objectTypeTitle = '查询';

  referable: boolean = false;

  package = undefined;

  /**
   * 同一作用域下下的查询
   */
  @derive
  get objectsInSameScope(): DomainObjectQuery[] {
    return this.store.unreferableObjects.filter(
      (i): i is DomainObjectQuery => DomainObjectFactory.isQuery(i) && i.id !== this.id
    );
  }

  /**
   * 不能被引用
   */
  objectsDependentOnMe = NoopArray;

  /**
   * 当前命令聚合的规则
   */
  @derive
  get rules(): DomainObjectRule[] {
    return this.store.rules.filter(i => i.aggregator?.id === this.id);
  }

  /**
   * 原始提取的依赖
   */
  @derive
  get rawDependencies() {
    return extraDependenciesFromQuery(this.dsl);
  }

  /**
   * 关联。查询可以关联 DTO
   */
  @derive
  get associations() {
    return Array.from(this.rawDependencies.association)
      .map(i => this.store.getObjectById(i))
      .filter(booleanPredicate);
  }

  /**
   * 依赖。查询可以依赖 DTO
   */
  @derive
  get dependencies() {
    return Array.from(this.rawDependencies.dependency)
      .map(i => this.store.getObjectById(i))
      .filter(booleanPredicate);
  }

  /**
   * 命令可以聚合规则
   */
  @derive
  get aggregations() {
    return this.rules;
  }

  compositions = NoopArray;

  /**
   * 当关联的数据长度不匹配时存在引用错误
   */
  @derive
  get hasReferencesError() {
    return (
      this.rawDependencies.dependency.size !== this.dependencies.length ||
      this.rawDependencies.association.size !== this.associations.length
    );
  }

  override toTypescript(objectsInclued?: Set<DomainObject<any>>): string {
    return toTypescriptInteface(
      this,
      this.dsl.properties,
      id => {
        return this.store.getObjectById(id);
      },
      objectsInclued
    );
  }
}
