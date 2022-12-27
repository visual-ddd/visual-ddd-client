import { derive } from '@/lib/store';
import { EntityDSL } from '../dsl';
import { DomainObjectClass } from './DomainObjectClass';

export class DomainObjectEntity extends DomainObjectClass<EntityDSL> {
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
