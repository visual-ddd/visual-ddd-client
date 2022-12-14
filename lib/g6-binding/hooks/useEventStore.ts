import { useEffect, useMemo } from 'react';
import lowerFirst from 'lodash/lowerFirst';
import { useDisposer } from '@wakeapp/hooks';

const EVENT_REGEX = /^on[A-Z]/;

function normalizedEventName(name: string) {
  return name.slice(2).split('$').map(lowerFirst).join(':');
}

export function wrapPreventListenerOptions<T extends Record<string, any>>(options: T): T {
  // @ts-expect-error
  options.triggerBy = 'COMPONENT';
  return options;
}

function shouldPrevent(evt: any) {
  if (evt && typeof evt === 'object' && evt.options?.triggerBy === 'COMPONENT') {
    return true;
  }

  return false;
}

export function useEventStore<Props extends Record<string, any>>(props: Props) {
  const disposer = useDisposer();
  const store = useMemo(() => {
    const listeners: Record<string, Function> = {};
    const delegations: Record<string, Function> = {};
    let disposed = false;
    let delegationSubscriber: (name: string, handler: Function) => void;

    disposer.push(() => {
      disposed = true;
    });

    return {
      attach(name: string, listener: Function) {
        if (listeners[name] === listener) {
          return;
        }

        listeners[name] = listener;

        const normalizedName = normalizedEventName(name);

        // 通知有新的监听者
        if (!(normalizedName in delegations)) {
          const handler = (delegations[normalizedName] = (...args: any[]) => {
            if (disposed) {
              // 已销毁，避免销毁后触发事件
              return;
            }

            const evt = args[0];

            // 阻止事件，避免循环
            if (shouldPrevent(evt)) {
              return;
            }

            listeners[name]?.(...args);
          });
          delegationSubscriber?.(normalizedName, handler);
        }
      },

      hasListener(name: string) {
        return name in listeners;
      },

      getDelegations() {
        return delegations;
      },

      listenDelegationChange(subscriber: (name: string, handler: Function) => void) {
        delegationSubscriber = subscriber;
      },
    };
  }, []);

  useEffect(() => {
    const listeners = Object.keys(props).filter(i => {
      return EVENT_REGEX.test(i) && (typeof props[i] === 'function' || store.hasListener(i));
    });

    for (const listener of listeners) {
      store.attach(listener, props[listener]);
    }
  });

  return store;
}
