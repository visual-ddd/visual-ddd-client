import { useEffect, useMemo } from 'react';
import { Disposer } from '@wakeapp/utils';
import { DIIdentifier, DIValue, Container, getDisposerMethods, isLongTimeScope } from '@wakeapp/framework-core';

import { useDIContainer } from './useDIContainer';

/**
 * 获取所有相同标识符的注入
 * @param identifier
 * @returns
 */
export function useInjectAll<I extends DIIdentifier, T extends DIValue<I>>(
  identifier: I,
  defaultValue?: T[],
  container?: Container
): T[] {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const _container = container ?? useDIContainer();
  const instances = useMemo(() => {
    try {
      return _container.getAll(identifier);
    } catch (err) {
      if (defaultValue !== undefined && !_container.isBound(identifier)) {
        return defaultValue;
      }
      throw err;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier, _container]);

  // 自动释放
  useEffect(() => {
    const disposer = new Disposer();

    instances.forEach(instance => {
      if (instance != null && typeof instance === 'object' && !isLongTimeScope(instance)) {
        const disposerMethods = getDisposerMethods(instance);
        if (disposerMethods.length) {
          disposer.push(() => {
            disposerMethods.forEach(method => {
              (instance as any)[method]?.();
            });
          });
        }
      }
    });

    return () => {
      disposer.release();
    };
  }, [instances]);

  return instances as T[];
}
