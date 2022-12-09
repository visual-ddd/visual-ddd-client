import { EventBus } from '@wakeapp/framework-core';
import { useInject } from './useInject';

/**
 * 获取事件总线
 * @returns
 */
export function useEventBus(): EventBus {
  return useInject('DI.global.eventBus');
}
