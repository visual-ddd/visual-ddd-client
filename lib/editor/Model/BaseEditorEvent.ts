import { EventBus, EventsWithArg, EventsWithoutArg } from '@/lib/utils';
import { BaseNode } from './BaseNode';

/**
 * 编辑器模型事件
 */
export interface BaseEditorEventDefinitions {
  NODE_REMOVED: { node: BaseNode };
  NODE_CREATED: { node: BaseNode };
  NODE_APPEND_CHILD: { parent: BaseNode; child: BaseNode };
  NODE_REMOVE_CHILD: { parent: BaseNode; child: BaseNode };
  NODE_MOVE: { from?: BaseNode; node: BaseNode; to?: BaseNode };
  NODE_UPDATE_PROPERTY: { node: BaseNode; path: string; value: any };
  NODE_DELETE_PROPERTY: { node: BaseNode; path: string };
}

export type BaseEditorEventsWithoutArg = EventsWithoutArg<BaseEditorEventDefinitions>;

export type BaseEditorEventsWithArg = EventsWithArg<BaseEditorEventDefinitions>;

export class BaseEditorEvent extends EventBus<BaseEditorEventDefinitions> {}
