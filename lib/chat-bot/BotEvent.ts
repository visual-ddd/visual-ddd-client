import { EventBus, EventsWithArg, EventsWithoutArg } from '@/lib/utils';
import { Message } from './protocol';

/**
 * 聊天机器人事件
 */
export interface BotEventDefinitions {
  /**
   * 新增消息
   */
  MESSAGE_ADDED: { message: Message };

  /**
   * 显示聊天窗
   */
  SHOW: never;
}

export type BotEventsWithoutArg = EventsWithoutArg<BotEventDefinitions>;

export type BotEventsWithArg = EventsWithArg<BotEventDefinitions>;

export class BotEvent extends EventBus<BotEventDefinitions> {}
