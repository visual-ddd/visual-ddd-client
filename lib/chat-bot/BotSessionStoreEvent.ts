import { EventBus, EventsWithArg, EventsWithoutArg } from '@/lib/utils';

/**
 * 会话存储事件
 */
export interface BotSessionStoreEventDefinitions {
  /**
   * 会话变动
   */
  SESSION_CHANGE: { sessionId: string };
}

export type BotSessionStoreEventsWithoutArg = EventsWithoutArg<BotSessionStoreEventDefinitions>;

export type BotSessionStoreEventsWithArg = EventsWithArg<BotSessionStoreEventDefinitions>;

export class BotSessionStoreEvent extends EventBus<BotSessionStoreEventDefinitions> {}
