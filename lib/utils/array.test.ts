import { toArray } from './array';

test('toArray', () => {
  expect(toArray(1)).toEqual([1]);
  expect(toArray([1])).toEqual([1]);
  expect(toArray(undefined)).toEqual([]);
});
