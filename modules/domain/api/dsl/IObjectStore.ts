import { Entity, ValueObject } from './domain-model';
import { DTO } from './query-model';
import { DataObject } from './data-model';
import { Node } from './shared';

export interface IObjectStore {
  getObjectById: (id: string) => { object: Entity | ValueObject | DTO | DataObject; parent?: Node };
}
