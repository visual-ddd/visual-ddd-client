import { autorun, observable } from 'mobx';
import { derive } from './derive';

test('derive', () => {
  const a = observable({ count: 1 });
  const fn = jest.fn(() => a.count + 1);
  const c = derive(fn);

  expect(c.get()).toBe(2);
  expect(fn).toBeCalledTimes(1);

  autorun(() => {
    c.get();
  });

  expect(c.get()).toBe(2);
  expect(fn).toBeCalledTimes(2);

  // 如果有跟踪者，计算会缓存
  expect(c.get()).toBe(2);
  expect(fn).toBeCalledTimes(2);
});
