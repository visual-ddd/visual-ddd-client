import { BaseNode } from '@/lib/editor';
import { EventBus, EventsWithArg, EventsWithoutArg } from '@/lib/utils';
import { DataObject } from './DataObject';

/**
 * 对象模型事件
 */
export interface DataObjectEventDefinitions {
  /**
   * 名称变动事件
   */
  OBJECT_NAME_CHANGED: { node: BaseNode; object: DataObject };
}

export type DataObjectEventsWithoutArg = EventsWithoutArg<DataObjectEventDefinitions>;

export type DataObjectEventsWithArg = EventsWithArg<DataObjectEventDefinitions>;

export class DataObjectEvent extends EventBus<DataObjectEventDefinitions> {}
