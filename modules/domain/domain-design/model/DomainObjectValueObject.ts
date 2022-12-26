import { ValueObjectDSL } from '../dsl';

import { DomainObjectClass } from './DomainObjectClass';

export class DomainObjectValueObject extends DomainObjectClass<ValueObjectDSL> {
  override objectTypeTitle = '值对象';
}
