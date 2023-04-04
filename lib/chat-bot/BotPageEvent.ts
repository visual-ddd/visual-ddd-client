import { EventBus, EventsWithArg, EventsWithoutArg } from '@/lib/utils';

/**
 * 聊天窗口事件
 */
export interface BotPageEventDefinitions {
  /**
   * 尺寸变化
   */
  SIZE_CHANGE: { size: number };

  /**
   * 侧边栏变化
   */
  SIDEBAR_CHANGE: { folded: boolean };

  /**
   * 会话变动
   */
  SESSION_CHANGE: { sessionId: string };
}

export type BotPageEventsWithoutArg = EventsWithoutArg<BotPageEventDefinitions>;

export type BotPageEventsWithArg = EventsWithArg<BotPageEventDefinitions>;

export class BotPageEvent extends EventBus<BotPageEventDefinitions> {}
