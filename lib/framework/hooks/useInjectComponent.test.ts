import { FC } from 'react';
import { renderHook } from '@testing-library/react';
import { Container } from '@wakeapp/framework-core';

import { registerComponent } from '../di';

import { useInjectComponent } from './useInjectComponent';

const MOCK_IDENTIFIER: any = 'MOCK_IDENTIFIER';

test('useInjectComponent', () => {
  const container = new Container();
  const component = jest.fn();
  registerComponent(MOCK_IDENTIFIER, component, { container });

  const { result } = renderHook(() => useInjectComponent(MOCK_IDENTIFIER, undefined, container));

  expect(result.current[0]).toBe(component);
  expect(result.current[1]).toEqual({ current: undefined });
});

test('useInjectComponent with default', () => {
  const container = new Container();
  const defaultComponent: FC = () => {
    return null;
  };

  const { result } = renderHook(() => useInjectComponent(MOCK_IDENTIFIER, defaultComponent, container));

  expect(result.current[0]).toBe(defaultComponent);
  expect(result.current[1]).toEqual({ current: undefined });
});
