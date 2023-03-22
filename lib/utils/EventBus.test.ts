import { EventBus } from './EventBus';

test('not ready', () => {
  const bus = new EventBus<{ test: never }>({ notReadyYet: true });
  const fn = jest.fn();

  bus.on('test', fn);
  bus.emit('test');

  expect(fn).not.toBeCalled();
  bus.iAmReady();
  expect(fn).toBeCalledTimes(1);
});
