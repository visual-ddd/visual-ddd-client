import { useEffect, useMemo } from 'react';

import { DIIdentifier, DIValue, Container, getDisposerMethods, isLongTimeScope } from '@wakeapp/framework-core';

import { useDIContainer } from './useDIContainer';

/**
 * 获取注入
 * @param identifier
 * @returns
 */
export function useInject<I extends DIIdentifier, T extends DIValue<I>>(
  identifier: I,
  defaultValue?: T,
  container?: Container
): T {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const _container = container ?? useDIContainer();
  const instance = useMemo(() => {
    try {
      return _container.get(identifier);
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
    if (instance != null && typeof instance === 'object' && !isLongTimeScope(instance)) {
      const disposers = getDisposerMethods(instance);
      if (disposers.length) {
        return () => {
          disposers.forEach(method => {
            (instance as any)[method]?.();
          });
        };
      }
    }
  }, [instance]);

  return instance as T;
}
