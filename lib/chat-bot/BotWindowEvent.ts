import { EventBus, EventsWithArg, EventsWithoutArg } from '@/lib/utils';

/**
 * 聊天窗口事件
 */
export interface BotWindowEventDefinitions {
  /**
   * 显示聊天窗
   */
  SHOW: never;

  /**
   * 尺寸变化
   */
  SIZE_CHANGE: { size: number };
}

export type BotWindowEventsWithoutArg = EventsWithoutArg<BotWindowEventDefinitions>;

export type BotWindowEventsWithArg = EventsWithArg<BotWindowEventDefinitions>;

export class BotWindowEvent extends EventBus<BotWindowEventDefinitions> {}
