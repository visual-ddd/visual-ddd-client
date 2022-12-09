import { renderHook } from '@testing-library/react';
import { Container, configureDI, injectable, disposer } from '@wakeapp/framework-core';

import { useInjectAll } from './useInjectAll';

const MOCK_IDENTIFIER: any = 'MOCK_IDENTIFIER';

test('useInjectAll', () => {
  const container = new Container();
  configureDI(({ registerConstant }) => {
    registerConstant(MOCK_IDENTIFIER, 'MOCK_VALUE1');
    registerConstant(MOCK_IDENTIFIER, 'MOCK_VALUE2');
  }, container);

  const { result } = renderHook(() => useInjectAll(MOCK_IDENTIFIER, undefined, container));

  expect(result.current).toEqual(['MOCK_VALUE1', 'MOCK_VALUE2']);
});

test('useInjectAll 未注册场景', () => {
  const container = new Container();

  expect(() => {
    renderHook(() => useInjectAll(MOCK_IDENTIFIER, undefined, container));
  }).toThrowError();

  const { result: anotherResult } = renderHook(() => useInjectAll(MOCK_IDENTIFIER, ['hello'], container));
  expect(anotherResult.current).toEqual(['hello']);
});

test('自动释放', () => {
  const container = new Container();
  const dispose = jest.fn();
  const dispose2 = jest.fn();

  @injectable()
  class Test {
    @disposer()
    dispose = dispose;
  }

  @injectable()
  class Test2 {
    @disposer()
    dispose = dispose2;
  }
  configureDI(({ registerClass }) => {
    registerClass(MOCK_IDENTIFIER, Test);
    registerClass(MOCK_IDENTIFIER, Test2);
  }, container);

  const { unmount } = renderHook(() => useInjectAll(MOCK_IDENTIFIER, undefined, container));
  unmount();
  expect(dispose).toBeCalled();
  expect(dispose2).toBeCalled();
});
