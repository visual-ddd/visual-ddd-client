import { mergeCookie } from './merge-cookie';

test('mergeCookie', () => {
  const current = 'a=1; b=2';
  const coming = { c: '3', d: '4', a: '2' };
  const result = mergeCookie(current, coming);
  expect(result).toBe('c=3; d=4; a=1; b=2');
});
