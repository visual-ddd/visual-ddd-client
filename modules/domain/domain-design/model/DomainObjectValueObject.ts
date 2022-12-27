import { ValueObjectDSL } from '../dsl';

import { DomainObjectUnderAggregation } from './DomainObjectUnderAggregation';

export class DomainObjectValueObject extends DomainObjectUnderAggregation<ValueObjectDSL> {
  override get objectTypeTitle() {
    return '值对象';
  }
}
