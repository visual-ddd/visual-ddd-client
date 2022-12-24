import { NameDSL } from '../dsl';
import { DomainObject } from './DomainObject';

export interface IDomainObjectContainer {
  getObjectById(id: string): DomainObject<NameDSL> | undefined;
}
