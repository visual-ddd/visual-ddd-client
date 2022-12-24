import { override } from 'mobx';

import { ValueObjectDSL } from '../dsl';

import { DomainObjectClass } from './DomainObjectClass';

export class DomainObjectValueObject extends DomainObjectClass<ValueObjectDSL> {
  @override
  override get readableTitle() {
    return `值对象 - ${this.title}(${this.name})`;
  }
}
