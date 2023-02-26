import { isIdentifier, extraIdentifier, extraUpperCamelCaseFilter } from './utils';

test('isIdentifier', () => {
  expect(isIdentifier('')).toBeFalsy();
  expect(isIdentifier('  ')).toBeFalsy();
  expect(isIdentifier('_')).toBeTruthy();
  expect(isIdentifier('_123')).toBeTruthy();
  expect(isIdentifier('Hell')).toBeTruthy();
});

test('extraIdentifier', () => {
  expect(extraIdentifier('')).toEqual([]);
  expect(extraIdentifier("don't do that")).toEqual(['dont', 'do', 'that', 'dont-do-that']);
  expect(extraIdentifier('hello  world')).toEqual(['hello', 'world', 'hello-world']);
  expect(extraIdentifier('hello,world')).toEqual(['hello', 'world', 'hello-world']);
  expect(extraIdentifier('hello--world')).toEqual(['hello', 'world', 'hello-world']);
  expect(extraIdentifier('hello_world')).toEqual(['hello', 'world', 'hello-world']);
  expect(extraIdentifier('hello  world _hello $nima')).toEqual(['hello', 'world', 'nima', 'hello-world-hello-nima']);
});

test('extraUpperCamelCaseFilter', () => {
  expect(extraUpperCamelCaseFilter('hello')).toBe('hello');
  expect(extraUpperCamelCaseFilter('helloWorld')).toBe('World');
  expect(extraUpperCamelCaseFilter('hello_world')).toBe('world');
  expect(extraUpperCamelCaseFilter('hello$world')).toBe('world');
});
