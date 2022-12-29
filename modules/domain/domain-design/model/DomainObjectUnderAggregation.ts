/**
 * 聚合内对象
 */
import { derive } from '@/lib/store';
import { NoopArray } from '@wakeapp/utils';

import { NameDSL } from '../dsl';
import { DomainObject } from './DomainObject';
import { DomainObjectAggregation } from './DomainObjectAggregation';

export interface IDomainObjectUnderAggregation {
  /**
   * 归属的聚合
   */
  aggregation: DomainObjectAggregation | undefined;
}

export abstract class DomainObjectUnderAggregation<T extends NameDSL>
  extends DomainObject<T>
  implements IDomainObjectUnderAggregation
{
  @derive
  get package() {
    return this.aggregation;
  }

  /**
   * 同一作用域下的对象
   */
  @derive
  get objectsInSameScope() {
    return this.aggregation?.compositions.filter(i => i.id !== this.id) || NoopArray;
  }

  @derive
  get objectsDependentOnMe() {
    const list: DomainObject<NameDSL>[] = [];
    for (const obj of this.store.referableObjects) {
      if (obj.dependencies.some(dep => dep.id === this.id)) {
        list.push(obj);
        continue;
      }

      if (obj.associations.some(dep => dep.id === this.id)) {
        list.push(obj);
      }
    }

    return list;
  }

  /**
   * 归属聚合
   */
  @derive
  get aggregation() {
    if (this.parentId) {
      return this.store.getObjectById(this.parentId) as DomainObjectAggregation;
    }

    return undefined;
  }
}
