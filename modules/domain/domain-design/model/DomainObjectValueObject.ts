import { ValueObjectDSL } from '../dsl';

import { DomainObjectClass } from './DomainObjectClass';

export class DomainObjectValueObject extends DomainObjectClass<ValueObjectDSL> {
  override get objectTypeTitle() {
    return '值对象';
  }
}
