import { derive } from '@/lib/store';
import { booleanPredicate, NoopArray } from '@wakeapp/utils';
import { makeObservable } from 'mobx';
import { ClassDSL, extraDependenciesFromClass } from '../dsl';
import { DomainObjectInject } from './DomainObject';
import { DomainObjectUnderAggregation } from './DomainObjectUnderAggregation';

/**
 * 实体
 */
export abstract class DomainObjectClass<T extends ClassDSL = ClassDSL> extends DomainObjectUnderAggregation<T> {
  referable: boolean = true;

  get objectTypeTitle() {
    return '类';
  }

  @derive({ requiresReaction: true })
  get rawDependencies() {
    return extraDependenciesFromClass(this.dsl);
  }

  /**
   * 依赖
   */
  @derive
  get dependencies() {
    return Array.from(this.rawDependencies.dependency)
      .map(i => {
        return this.store.getObjectById(i);
      })
      .filter(booleanPredicate);
  }

  /**
   * 关联
   */
  @derive
  get associations() {
    return Array.from(this.rawDependencies.association)
      .map(i => {
        return this.store.getObjectById(i);
      })
      .filter(booleanPredicate);
  }

  aggregations = NoopArray;
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

  constructor(inject: DomainObjectInject) {
    super(inject);

    makeObservable(this);
  }
}
