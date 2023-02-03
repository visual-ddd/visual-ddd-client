import { Entity, Node, ValueObject } from './domain-model';
import { DTO } from './query-model';
import { DataObject } from './data-model';

export interface IObjectStore {
  getObjectById: (id: string) => { object: Entity | ValueObject | DTO | DataObject; parent?: Node };
}
