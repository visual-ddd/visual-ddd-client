import { KeyboardBinding, KeyboardBindingRegistry } from './KeyboardBinding';

test('KeyboardBinding', () => {
  const kb = new KeyboardBinding();
  const hd = jest.fn();
  kb.bindKey({
    name: 'foo',
    title: 'Foo',
    key: {
      macos: 'command + s',
      other: 'ctrl + s',
    },
    handler: hd,
  });

  const registry = {
    bind: jest.fn(),
    unbind: jest.fn(),
    unbindAll: jest.fn(),
  } satisfies KeyboardBindingRegistry;

  kb.bindRegistry(registry);

  expect(registry.bind.mock.calls[0][0]).toEqual('ctrl + s');
  registry.bind.mock.calls[0][1]();
  expect(hd).toBeCalledTimes(1);

  kb.trigger('foo');
  expect(hd).toBeCalledTimes(2);

  kb.unbindKey('foo');
  expect(registry.unbind).toBeCalledWith('ctrl + s');

  kb.dispose();
  expect(registry.unbindAll).toBeCalled();
});
