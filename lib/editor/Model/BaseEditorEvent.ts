import { EventBus, EventsWithArg, EventsWithoutArg } from '@/lib/utils';
import { BaseNode } from './BaseNode';

/**
 * 编辑器模型事件
 */
export interface BaseEditorEventDefinitions {
  NODE_CREATED: { node: BaseNode };
  NODE_APPEND_CHILD: { parent: BaseNode; child: BaseNode };
  NODE_BEFORE_REMOVE_CHILD: { parent: BaseNode; child: BaseNode };
  NODE_REMOVE_CHILD: { parent: BaseNode; child: BaseNode };
  NODE_REMOVED: { node: BaseNode };
  NODE_MOVE: { from?: BaseNode; node: BaseNode; to?: BaseNode };
  NODE_BEFORE_UPDATE_PROPERTY: { node: BaseNode; path: string; value: any };
  NODE_UPDATE_PROPERTY: { node: BaseNode; path: string; value: any };
  NODE_DELETE_PROPERTY: { node: BaseNode; path: string };
  NODE_ACTIVE: { node: BaseNode };
  NODE_UNACTIVE: { node: BaseNode };

  // 锁定
  NODE_LOCKED: { node: BaseNode };
  NODE_UNLOCKED: { node: BaseNode };

  // 外部命令，这里命令本身不由 model 层处理(Model 层仅处理状态)
  // model 仅作为中转，具体由下级依赖进行处理
  /**
   * 聚焦节点
   */
  CMD_FOCUS_NODE: { node: BaseNode };
}

export type BaseEditorEventsWithoutArg = EventsWithoutArg<BaseEditorEventDefinitions>;

export type BaseEditorEventsWithArg = EventsWithArg<BaseEditorEventDefinitions>;

export class BaseEditorEvent extends EventBus<BaseEditorEventDefinitions> {}
