import { useEffect, useRef } from 'react';
import { EventName, EventArgument, EventBus } from '@wakeapp/framework-core';

import { useEventBus } from './useEventBus';

/**
 * 监听事件总线事件
 */
export function useEventBusListener<N extends EventName, A extends EventArgument<N>>(
  event: N,
  listener: (arg: A) => void,
  eventBus?: EventBus
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const _eventBus = eventBus ?? useEventBus();
  const callbackRef = useRef(listener);
  callbackRef.current = listener;

  useEffect(() => {
    return _eventBus.on(event, (arg: any) => callbackRef.current(arg));
  }, [event, _eventBus]);
}
