import { EventBus, EventsWithArg, EventsWithoutArg } from '@/lib/utils';

/**
 * 画布事件
 */
export interface CanvasEventDefinitions {}

export type CanvasEventsWithoutArg = EventsWithoutArg<CanvasEventDefinitions>;

export type CanvasEventsWithArg = EventsWithArg<CanvasEventDefinitions>;

export class CanvasEvent extends EventBus<CanvasEventDefinitions> {}
