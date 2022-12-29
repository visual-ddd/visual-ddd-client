import { BaseNode } from '@/lib/editor';
import { EventBus, EventsWithArg, EventsWithoutArg } from '@/lib/utils';
import { NameDSL } from '../dsl';
import { DomainObject } from './DomainObject';

/**
 * 对象模型事件
 */
export interface DomainObjectEventDefinitions {
  /**
   * 名称变动事件
   */
  OBJECT_NAME_CHANGED: { node: BaseNode; object: DomainObject<NameDSL> };

  /**
   * 聚合关系变动前事件
   */
  OBJECT_BEFORE_AGGREGATION_CHANGE: { node: BaseNode; object: DomainObject<NameDSL>; current?: DomainObject<NameDSL> };

  /**
   * 聚合关系变动事件
   */
  OBJECT_AGGREGATION_CHANGED: {
    node: BaseNode;
    object: DomainObject<NameDSL>;
    previous?: DomainObject<NameDSL>;
    current?: DomainObject<NameDSL>;
  };
}

export type DomainObjectEventsWithoutArg = EventsWithoutArg<DomainObjectEventDefinitions>;

export type DomainObjectEventsWithArg = EventsWithArg<DomainObjectEventDefinitions>;

export class DomainObjectEvent extends EventBus<DomainObjectEventDefinitions> {}
