import { isIdentifier, extraIdentifier, extraIdentifiersFromWords, extraUpperCamelCaseFilter } from './utils';

test('isIdentifier', () => {
  expect(isIdentifier('')).toBeFalsy();
  expect(isIdentifier('  ')).toBeFalsy();
  expect(isIdentifier('_')).toBeTruthy();
  expect(isIdentifier('_123')).toBeTruthy();
  expect(isIdentifier('Hell')).toBeTruthy();
});

test('extraIdentifier', () => {
  expect(extraIdentifier('')).toEqual(undefined);
  expect(extraIdentifier("don't do that")).toEqual(['dont', 'do', 'that'].join('-'));
  expect(extraIdentifier('hello  world')).toEqual(['hello', 'world'].join('-'));
  expect(extraIdentifier('hello,world')).toEqual(['hello', 'world'].join('-'));
  expect(extraIdentifier('hello--world')).toEqual(['hello', 'world'].join('-'));
  expect(extraIdentifier('hello_world')).toEqual(['hello', 'world'].join('-'));
  expect(extraIdentifier('hello  world _hello $nima')).toEqual(['hello', 'world', 'hello', 'nima'].join('-'));
});

test('extraUpperCamelCaseFilter', () => {
  expect(extraUpperCamelCaseFilter('hello')).toBe('hello');
  expect(extraUpperCamelCaseFilter('helloWorld')).toBe('World');
  expect(extraUpperCamelCaseFilter('hello_world')).toBe('world');
  expect(extraUpperCamelCaseFilter('hello$world')).toBe('world');
});

test('extraIdentifiersFromWords', () => {
  expect(extraIdentifiersFromWords([])).toEqual([]);
  expect(extraIdentifiersFromWords(['hello', 'world'])).toEqual(['hello', 'world']);
  expect(extraIdentifiersFromWords(['hello', 'world', 'hello', 'world'])).toEqual(['hello', 'world']);
  expect(extraIdentifiersFromWords(['hello', 'world', 'hello', 'world', 'hello_world'])).toEqual([
    'hello',
    'world',
    'hello-world',
  ]);
});
