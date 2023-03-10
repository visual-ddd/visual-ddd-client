import { mergeCookie } from './merge-cookie';

test('mergeCookie', () => {
  const current = 'a=1; b=2';
  const coming = { c: '3', d: '4', a: '2' };
  const result = mergeCookie(current, coming);
  expect(result).toBe('a=2; b=2; c=3; d=4');

  const result2 = mergeCookie(current, coming, ['a', 'c']);
  expect(result2).toBe('b=2; d=4');
});
