import { EventBus, EventsWithArg, EventsWithoutArg } from '@/lib/utils';
import { UbiquitousLanguageItem } from './types';

/**
 * 对象模型事件
 */
export interface UbiquitousLanguageEventsDefinitions {
  /**
   * item 新增
   */
  ITEM_ADDED: { item: UbiquitousLanguageItem; index: number };

  /**
   * item 移除
   */
  ITEM_REMOVED: { item: UbiquitousLanguageItem; index: number };

  /**
   * item 变更
   */
  ITEM_UPDATED: { item: UbiquitousLanguageItem; key: keyof UbiquitousLanguageItem; value: string };
}

export type UbiquitousLanguageEventsWithoutArg = EventsWithoutArg<UbiquitousLanguageEventsDefinitions>;

export type UbiquitousLanguageEventsWithArg = EventsWithArg<UbiquitousLanguageEventsDefinitions>;

export class UbiquitousLanguageEvent extends EventBus<UbiquitousLanguageEventsDefinitions> {}
