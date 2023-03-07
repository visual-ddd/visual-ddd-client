import { EventBus, EventsWithArg, EventsWithoutArg } from '@/lib/utils';

/**
 * 编辑器模型事件
 */
export interface DomainDesignerEventDefinitions {
  /**
   * 领域对象自动生成成功
   */
  DOMAIN_OBJECT_AUTO_GENERATED: {
    /**
     * 取消操作
     * @returns
     */
    revoke: () => void;
  };
}

export type DomainDesignerEventsWithoutArg = EventsWithoutArg<DomainDesignerEventDefinitions>;

export type DomainDesignerEventsWithArg = EventsWithArg<DomainDesignerEventDefinitions>;

export class DomainDesignerEvent extends EventBus<DomainDesignerEventDefinitions> {}
