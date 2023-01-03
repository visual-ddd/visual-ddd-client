import { getPrefixPath } from './object';

test('getPrefixPath', () => {
  expect(getPrefixPath('a.b.c', 'b')).toBe('a.b');
  expect(getPrefixPath('a.b.c', 'c')).toBe('a.b.c');
  expect(getPrefixPath('a.b.c', 'd')).toBe('a.b.c');
  expect(getPrefixPath('arr.0.center.c', 'center')).toBe('arr.0.center');
});
