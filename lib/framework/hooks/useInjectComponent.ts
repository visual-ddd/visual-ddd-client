import { ComponentType, useRef } from 'react';

import { DIIdentifier, DIValue, Container } from '@wakeapp/framework-core';

import { useInject } from './useInject';

export type ExtraRefType<T> = T extends { ref: infer P } ? P : never;

/**
 * 获取注入的组件
 */
export function useInjectComponent<I extends DIIdentifier, T extends DIValue<I>>(
  identifier: I,
  defaultImplementation?: ComponentType<T>,
  container?: Container
): [ComponentType<T>, ExtraRefType<T>] {
  const ref = useRef();
  // @ts-expect-error
  const component = useInject(identifier, defaultImplementation, container);

  return [component as any as ComponentType<T>, ref as ExtraRefType<T>];
}
