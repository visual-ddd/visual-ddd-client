import { allow, valueTransform } from './utils';

test('allow', () => {
  expect(allow('1', '', 'CamelCase')).toBe('');
  expect(allow('0', '', 'CamelCase')).toBe('');
  expect(allow('a', '', 'CamelCase')).toBe('A');
  expect(allow('z', '', 'CamelCase')).toBe('Z');
  expect(allow('$', '', 'CamelCase')).toBe('$');
  expect(allow('_', '', 'CamelCase')).toBe('_');
  expect(allow('A', '', 'CamelCase')).toBe('A');
  expect(allow('Z', '', 'CamelCase')).toBe('Z');
  expect(allow('Z', 'a', 'CamelCase')).toBe('Z');
  expect(allow('1', 'a', 'CamelCase')).toBe('1');
  expect(allow('0', 'a', 'CamelCase')).toBe('0');

  expect(allow('Z', '', 'camelCase')).toBe('z');
  expect(allow('z', '', 'camelCase')).toBe('z');
  expect(allow('Z', 'a', 'camelCase')).toBe('Z');
  expect(allow('z', 'a', 'camelCase')).toBe('z');

  expect(allow('Z', '', 'SNAKE_CASE')).toBe('Z');
  expect(allow('Z', 'Z', 'SNAKE_CASE')).toBe('Z');
  expect(allow('z', 'A', 'SNAKE_CASE')).toBe('Z');
  expect(allow('a', 'A', 'SNAKE_CASE')).toBe('A');

  expect(allow('Z', '', 'snake_case')).toBe('z');
  expect(allow('Z', 'Z', 'snake_case')).toBe('z');
  expect(allow('z', 'A', 'snake_case')).toBe('z');
  expect(allow('a', 'A', 'snake_case')).toBe('a');
});

test('valueTransform', () => {
  expect(valueTransform('', 'CamelCase')).toBe('');
  expect(valueTransform('abc', 'CamelCase')).toBe('Abc');
  expect(valueTransform('AbcDef', 'CamelCase')).toBe('AbcDef');
  expect(valueTransform('AbcDef', 'camelCase')).toBe('abcDef');
  expect(valueTransform('abcdAdc', 'SNAKE_CASE')).toBe('ABCDADC');
  expect(valueTransform('abcd_Adc', 'SNAKE_CASE')).toBe('ABCD_ADC');
  expect(valueTransform('Abcd_Adc', 'snake_case')).toBe('abcd_adc');
});
