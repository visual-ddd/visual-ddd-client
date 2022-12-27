import { derive } from '@/lib/store';
import { EntityDSL } from '../dsl';
import { DomainObjectUnderAggregation } from './DomainObjectUnderAggregation';

export class DomainObjectEntity extends DomainObjectUnderAggregation<EntityDSL> {
  /**
   * 是否为聚合根
   */
  @derive
  get isAggregationRoot() {
    return !!this.dsl.isAggregationRoot;
  }

  @derive
  override get objectTypeTitle() {
    return this.isAggregationRoot ? '聚合根' : '实体';
  }
}
