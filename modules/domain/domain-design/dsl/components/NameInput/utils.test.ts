import { allow } from './utils';

test('allow', () => {
  expect(allow('1', '', 'CamelCase')).toBe(false);
  expect(allow('0', '', 'CamelCase')).toBe(false);
  expect(allow('a', '', 'CamelCase')).toBe(false);
  expect(allow('z', '', 'CamelCase')).toBe(false);
  expect(allow('$', '', 'CamelCase')).toBe(true);
  expect(allow('_', '', 'CamelCase')).toBe(true);
  expect(allow('A', '', 'CamelCase')).toBe(true);
  expect(allow('Z', '', 'CamelCase')).toBe(true);
  expect(allow('Z', 'a', 'CamelCase')).toBe(true);
  expect(allow('1', 'a', 'CamelCase')).toBe(true);
  expect(allow('0', 'a', 'CamelCase')).toBe(true);

  expect(allow('Z', '', 'camelCase')).toBe(false);
  expect(allow('z', '', 'camelCase')).toBe(true);
  expect(allow('Z', 'a', 'camelCase')).toBe(true);
  expect(allow('z', 'a', 'camelCase')).toBe(true);

  expect(allow('Z', '', 'SNAKE_CASE')).toBe(true);
  expect(allow('Z', 'Z', 'SNAKE_CASE')).toBe(true);
  expect(allow('z', 'A', 'SNAKE_CASE')).toBe(false);
  expect(allow('a', 'A', 'SNAKE_CASE')).toBe(false);
});
