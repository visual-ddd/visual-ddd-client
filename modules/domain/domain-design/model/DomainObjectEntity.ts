import { override } from 'mobx';
import { EntityDSL } from '../dsl';
import { DomainObjectClass } from './DomainObjectClass';

export class DomainObjectEntity extends DomainObjectClass<EntityDSL> {
  @override
  override get readableTitle() {
    return `实体${this.dsl.isAggregationRoot ? '(聚合根)' : ''} - ${this.title}(${this.name})`;
  }
}
