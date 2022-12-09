import { renderHook } from '@testing-library/react';
import {
  Container,
  registerConstant,
  registerClass,
  registerPageClass,
  registerCreator,
  disposer,
  injectable,
  page,
  setCurrentPageInstanceGetter,
} from '@wakeapp/framework-core';

import { useInject } from './useInject';

describe('useInject', () => {
  const MOCK_IDENTIFIER: any = 'MOCK_IDENTIFIER';
  test('默认值', () => {
    const container = new Container();

    const { result } = renderHook(() => useInject(MOCK_IDENTIFIER, 'DEFAULT_VALUE', container));

    expect(result.current).toBe('DEFAULT_VALUE');
  });

  test('未找到异常', () => {
    expect(() => {
      renderHook(() => useInject(MOCK_IDENTIFIER));
    }).toThrowError();
  });

  test('多值异常', () => {
    const container = new Container();
    registerConstant(MOCK_IDENTIFIER, 'MOCK_DATA1', { container });
    registerConstant(MOCK_IDENTIFIER, 'MOCK_DATA2', { container });

    expect(() => {
      const { result } = renderHook(() => useInject(MOCK_IDENTIFIER, undefined, container));
    }).toThrowError('Ambiguous match found');
  });

  test('缓存', () => {
    const container = new Container();
    const fn = jest.fn(() => ['MOCK_DATA']);
    registerCreator(MOCK_IDENTIFIER, fn, { container });

    const { result, rerender } = renderHook(() => useInject(MOCK_IDENTIFIER, undefined, container));
    expect(result.current).toEqual(['MOCK_DATA']);

    rerender();
    // 只会被调用一次
    expect(fn).toBeCalledTimes(1);
  });

  test('自动释放', () => {
    const container = new Container();
    const dispose = jest.fn();

    @injectable()
    class Test {
      @disposer()
      dispose = dispose;
    }

    registerClass(MOCK_IDENTIFIER, Test, { container });

    const { result, unmount } = renderHook(() => useInject(MOCK_IDENTIFIER, undefined, container));

    expect(result.current).toBeInstanceOf(Test);
    unmount();
    expect(dispose).toBeCalled();
  });

  test('page、singleton 不会自动释放', () => {
    const instance = {};
    const container = new Container();
    const dispose = jest.fn();
    setCurrentPageInstanceGetter(() => instance);

    @injectable()
    @page()
    class Test {
      @disposer()
      dispose = dispose;
    }

    registerPageClass(MOCK_IDENTIFIER, Test, { container });

    const { result, unmount } = renderHook(() => useInject(MOCK_IDENTIFIER, undefined, container));

    expect(result.current).toBeInstanceOf(Test);
    unmount();
    expect(dispose).not.toBeCalled();
  });
});
