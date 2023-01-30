import {
  CompletionImplement,
  CompletionImplementIdentifierUpperSnakeCase,
  CompletionImplementIdentifierLowerSnakeCase,
  CompletionImplementIdentifierUpperCamelCase,
  CompletionImplementIdentifierLowerCamelCase,
} from './CompletionImplement';

test('CompletionImplement', () => {
  const c = new CompletionImplement();
  c.setCandidate(['hello', 'world', 'foo', 'bar']);
  expect(c.search(' ')).toEqual([]);

  expect(c.search('o')).toEqual(['world', 'foo', 'hello']);
});

test('CompletionImplementIdentifierUpperSnakeCase', () => {
  const c = new CompletionImplementIdentifierUpperSnakeCase();
  c.setCandidate(['hello', 'world', 'foo', 'bar']);

  expect(c.search(' ')).toEqual([]);
  expect(c.search('O')).toEqual(['WORLD', 'FOO', 'HELLO']);
  expect(c.search('OO')).toEqual(['FOO', 'WORLD', 'HELLO']);
  expect(c.search('HELLO_OO')).toEqual(['HELLO_FOO', 'HELLO_WORLD', 'HELLO_HELLO']);
  expect(c.search('HELLO_WORLD_')).toEqual([]);
  expect(c.search('HELLO_WORLD_BAR')).toEqual(['HELLO_WORLD_BAR']);
});

test('CompletionImplementIdentifierLowerSnakeCase', () => {
  const c = new CompletionImplementIdentifierLowerSnakeCase();
  c.setCandidate(['hello', 'world', 'foo', 'bar']);

  expect(c.search(' ')).toEqual([]);
  expect(c.search('o')).toEqual(['world', 'foo', 'hello']);
  expect(c.search('oo')).toEqual(['foo', 'world', 'hello']);
  expect(c.search('hello_oo')).toEqual(['hello_foo', 'hello_world', 'hello_hello']);
  expect(c.search('hello_world_')).toEqual([]);
  expect(c.search('hello_world_bar')).toEqual(['hello_world_bar']);
});

test('CompletionImplementIdentifierUpperCamelCase', () => {
  const c = new CompletionImplementIdentifierUpperCamelCase();
  c.setCandidate(['hello', 'world', 'foo', 'bar']);

  expect(c.search(' ')).toEqual([]);

  expect(c.search('o')).toEqual(['World', 'Foo', 'Hello']);
  expect(c.search('oo')).toEqual(['Foo', 'World', 'Hello']);
  expect(c.search('helloOo')).toEqual(['HelloFoo', 'HelloWorld', 'HelloHello']);
});

test('CompletionImplementIdentifierLowerCamelCase', () => {
  const c = new CompletionImplementIdentifierLowerCamelCase();
  c.setCandidate(['hello', 'world', 'foo', 'bar']);

  expect(c.search('o')).toEqual(['world', 'foo', 'hello']);
  expect(c.search('helloOo')).toEqual(['helloFoo', 'helloWorld', 'helloHello']);
});
