import { renderHook } from '@testing-library/react';
import { EventBus } from '@wakeapp/framework-core';

import { useEventBusListener } from './useEventBusListener';

test('useEventBusListener', () => {
  const eventBus = new EventBus();

  const listener = jest.fn();
  const listener2 = jest.fn();
  const NAME: any = 'MOCK_EVENT';

  const { rerender, unmount } = renderHook(({ listener }) => useEventBusListener(NAME, listener, eventBus), {
    initialProps: {
      listener,
    },
  });

  eventBus.emit(NAME, 'MOCK_DATA');
  expect(listener).toBeCalledWith('MOCK_DATA');

  // 更新
  rerender({ listener: listener2 });

  eventBus.emit(NAME, 'MOCK_DATA2');
  expect(listener2).toBeCalledWith('MOCK_DATA2');
  expect(listener).toBeCalledTimes(1);

  // 卸载
  unmount();
  eventBus.emit(NAME, 'MOCK_DATA3');
  expect(listener2).toBeCalledTimes(1);
  expect(listener).toBeCalledTimes(1);
});
