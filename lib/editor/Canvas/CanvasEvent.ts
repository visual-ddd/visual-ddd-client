import { EventBus, EventsWithArg, EventsWithoutArg } from '@/lib/utils';

/**
 * 画布事件
 */
export interface CanvasEventDefinitions {
  /**
   * 可见性变动
   */
  NODE_VISIBLE_CHANGE: { id: string; visible: boolean };
}

export type CanvasEventsWithoutArg = EventsWithoutArg<CanvasEventDefinitions>;

export type CanvasEventsWithArg = EventsWithArg<CanvasEventDefinitions>;

export class CanvasEvent extends EventBus<CanvasEventDefinitions> {}
