import { updateState, getState, isExceed, removeState } from './ip-state';

test('state', () => {
  jest.useFakeTimers();

  updateState('1', '1');
  updateState('1', '1');
  updateState('1', '2');
  updateState('1', '3');
  updateState('1', '3');
  updateState('1', '4');
  expect(getState('1')).toEqual([
    ['1', expect.any(Number)],
    ['2', expect.any(Number)],
    ['3', expect.any(Number)],
    ['4', expect.any(Number)],
  ]);

  expect(isExceed('1')).toBe(true);

  jest.advanceTimersByTime(1000 * 60 * (3 + 1));

  updateState('1', '0');
  expect(getState('1')).toEqual([['0', expect.any(Number)]]);

  removeState('1', '0');
  expect(getState('1')).toEqual([]);
});
