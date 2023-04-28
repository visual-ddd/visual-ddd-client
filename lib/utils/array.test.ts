import { toArray, randomPick } from './array';

test('toArray', () => {
  expect(toArray(1)).toEqual([1]);
  expect(toArray([1])).toEqual([1]);
  expect(toArray(undefined)).toEqual([]);
});

test('randomPick', () => {
  expect(randomPick([1])).toEqual(1);
  expect(randomPick([])).toEqual(undefined);
  expect([1, 2, 3].includes(randomPick([1, 2, 3]))).toBeTruthy();
});
