import { renderHook } from '@testing-library/react';
import { useSyncEffect } from './useSyncEffect';

test('useSyncEffect', () => {
  const destructor = jest.fn();
  const effect = jest.fn(() => destructor);

  const { rerender, unmount } = renderHook(
    props => {
      useSyncEffect(effect, [props.count]);
    },
    { initialProps: { count: 0 } }
  );

  expect(effect).toBeCalledTimes(1);
  expect(destructor).not.toBeCalled();

  rerender({ count: 1 });

  expect(effect).toBeCalledTimes(2);
  expect(destructor).toBeCalledTimes(1);

  unmount();

  expect(destructor).toBeCalledTimes(2);
});
