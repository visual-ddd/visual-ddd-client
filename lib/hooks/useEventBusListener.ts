import { EventBus } from '@/lib/utils';
import { Disposer, NoopArray } from '@wakeapp/utils';
import { useEffect } from 'react';

export function useEventBusListener<T extends {}, Ctor extends EventBus<T>>(
  eventBus: Ctor,
  execute: (on: Ctor['on']) => void,
  deps?: ReadonlyArray<unknown>
) {
  useEffect(() => {
    const disposer = new Disposer();

    const on = (...args: any) => {
      disposer.push(eventBus.on.apply(eventBus, args));
    };

    execute(on as any);

    return disposer.release;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventBus, ...(deps ?? NoopArray)]);
}
