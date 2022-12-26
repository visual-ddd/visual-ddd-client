import { derive } from '@/lib/store';
import { EntityDSL } from '../dsl';
import { DomainObjectClass } from './DomainObjectClass';

export class DomainObjectEntity extends DomainObjectClass<EntityDSL> {
  @derive
  override get objectTypeTitle() {
    return this.dsl.isAggregationRoot ? '聚合根' : '实体';
  }
}
