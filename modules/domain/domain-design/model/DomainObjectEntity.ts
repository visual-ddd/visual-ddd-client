import { override } from 'mobx';
import { EntityDSL } from '../dsl';
import { DomainObjectClass } from './DomainObjectClass';

export class DomainObjectEntity extends DomainObjectClass<EntityDSL> {
  override objectTypeTitle = '实体';

  @override
  override get readableTitle() {
    return `${this.title}(${this.name})${this.dsl.isAggregationRoot ? '-(聚合根)' : ''}`;
  }
}
