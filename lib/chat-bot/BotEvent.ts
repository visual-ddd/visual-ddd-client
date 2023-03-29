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
   * 消息请求完成, 可能成功，也可能失败
   */
  MESSAGE_FINISHED: { message: Message };

  /**
   * 消息删除
   */
  MESSAGE_REMOVED: { message: Message };

  /**
   * 消息更新
   */
  MESSAGE_UPDATED: { message: Message };

  /**
   * 显示聊天窗
   */
  SHOW: never;
}

export type BotEventsWithoutArg = EventsWithoutArg<BotEventDefinitions>;

export type BotEventsWithArg = EventsWithArg<BotEventDefinitions>;

export class BotEvent extends EventBus<BotEventDefinitions> {}
