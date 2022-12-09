import { renderHook } from '@testing-library/react';
import { container } from '@wakeapp/framework-core';

import { useDIContainer } from './useDIContainer';

test('默认获取到全局 container', () => {
  const { result } = renderHook(() => useDIContainer());

  expect(result.current).toBe(container);
});
