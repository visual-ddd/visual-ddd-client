/**
 * 聚合内对象
 */

import { derive } from '@/lib/store';
import { ClassDSL } from '../dsl';
import { DomainObjectAggregation } from './DomainObjectAggregation';
import { DomainObjectClass } from './DomainObjectClass';

export interface IDomainObjectUnderAggregation {
  /**
   * 归属的聚合
   */
  aggregation: DomainObjectAggregation | undefined;
}

export class DomainObjectUnderAggregation<T extends ClassDSL>
  extends DomainObjectClass<T>
  implements IDomainObjectUnderAggregation
{
  /**
   * 归属聚合
   */
  @derive
  get aggregation() {
    if (this.parentId) {
      return this.container.getObjectById(this.parentId) as DomainObjectAggregation;
    }

    return undefined;
  }
}
