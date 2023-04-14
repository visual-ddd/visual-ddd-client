import { normalizedCamelCase } from './name-case';

test('expect', () => {
  expect(normalizedCamelCase('a')).toBe('a');
  expect(normalizedCamelCase('A')).toBe('a');
  expect(normalizedCamelCase('ABC')).toBe('abc');
  expect(normalizedCamelCase('ABCDom')).toBe('abcDom');
  expect(normalizedCamelCase('ABC', true)).toBe('ABC');
  expect(normalizedCamelCase('abcABC')).toBe('abcABC');
});
