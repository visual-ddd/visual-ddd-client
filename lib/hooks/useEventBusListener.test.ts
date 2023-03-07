import { EventBus } from '../utils';
import { useEventBusListener } from './useEventBusListener';
import { renderHook } from '@testing-library/react';

class MyEventBus extends EventBus<{ foo: { bar: number } }> {
  getInner() {
    return this.eventBus;
  }
}

test('useEventBusListener', () => {
  const eventBus = new MyEventBus();
  const eventBus2 = new MyEventBus();
  const effect = jest.fn();

  const { rerender, unmount } = renderHook(
    props => {
      useEventBusListener(props.eventBus, on => {
        on('foo', effect);
      });
    },
    {
      initialProps: { eventBus },
    }
  );

  eventBus.emit('foo', { bar: 1 });
  expect(effect).toHaveBeenLastCalledWith({ bar: 1 });
  expect(eventBus.getInner().listenerCount('foo')).toBe(1);

  rerender({ eventBus: eventBus2 });

  // should release listener, and never be called again
  expect(eventBus.getInner().listenerCount('foo')).toBe(0);
  eventBus.emit('foo', { bar: 1 });
  expect(effect).toHaveBeenCalledTimes(1);

  eventBus2.emit('foo', { bar: 2 });
  expect(effect).toHaveBeenLastCalledWith({ bar: 2 });

  unmount();
  expect(eventBus2.getInner().listenerCount('foo')).toBe(0);
});
