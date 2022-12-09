import { renderHook } from '@testing-library/react';
import { eventBus } from '@wakeapp/framework-core';

import { useEventBus } from './useEventBus';

test('默认获取到全局 eventBus', () => {
  const { result } = renderHook(() => useEventBus());

  expect(result.current).toBe(eventBus);
});
