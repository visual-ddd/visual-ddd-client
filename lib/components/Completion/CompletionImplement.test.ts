import {
  CompletionImplement,
  CompletionImplementIdentifierUpperSnakeCase,
  CompletionImplementIdentifierLowerSnakeCase,
  CompletionImplementIdentifierUpperCamelCase,
  CompletionImplementIdentifierLowerCamelCase,
} from './CompletionImplement';

test('CompletionImplement', () => {
  const c = new CompletionImplement();
  c.setCandidate(['hello', 'world', 'foo', 'bar', '任意字符']);
  expect(c.search(' ')).toEqual([]);
  expect(c.search('任意')).toEqual(['任意字符']);

  expect(c.search('o')).toEqual(['foo']);
  expect(c.search('el')).toEqual(['hello']);
});

test('CompletionImplementIdentifierUpperSnakeCase', () => {
  const c = new CompletionImplementIdentifierUpperSnakeCase();
  c.setCandidate(['hello', 'world', 'foo', 'bar', 'tell-me-the-truth']);

  expect(c.search(' ')).toEqual([]);
  expect(c.search('O')).toEqual(['FOO']);
  expect(c.search('OO')).toEqual(['FOO']);
  expect(c.search('HELLO_OO')).toEqual(['HELLO_FOO', 'HELLO']);
  expect(c.search('HELLO_WORLD_')).toEqual(['HELLO_WORLD']);
  expect(c.search('HELLO_WORLD_BAR')).toEqual(['HELLO_WORLD_BAR', 'HELLO_WORLD']);

  // 组合测试
  expect(c.search('TELL')).toEqual(['TELL_ME_THE_TRUTH', 'HELLO']);
  expect(c.search('ME')).toEqual(['TELL_ME_THE_TRUTH']);

  expect(c.search('TELLME')).toEqual(['TELL_ME_THE_TRUTH']);
  expect(c.search('TELL_ME')).toEqual(['TELL_ME_THE_TRUTH', 'TELL_TELL_ME_THE_TRUTH']);
  expect(c.search('NOW_TELL')).toEqual(['NOW_TELL_ME_THE_TRUTH', 'NOW_HELLO']);
  expect(c.search('NOW_TELL_ME')).toEqual(['NOW_TELL_ME_THE_TRUTH', 'NOW_TELL_TELL_ME_THE_TRUTH', 'TELL_ME_THE_TRUTH']);
});

test('CompletionImplementIdentifierLowerSnakeCase', () => {
  const c = new CompletionImplementIdentifierLowerSnakeCase();
  c.setCandidate(['hello', 'world', 'foo', 'bar', 'tell-me-the-truth']);

  expect(c.search(' ')).toEqual([]);
  expect(c.search('o')).toEqual(['foo']);
  expect(c.search('oo')).toEqual(['foo']);
  expect(c.search('hello_oo')).toEqual(['hello_foo', 'hello']);
  expect(c.search('hello_world_')).toEqual(['hello_world']);
  expect(c.search('hello_world_bar')).toEqual(['hello_world_bar', 'hello_world']);
  expect(c.search('tell')).toEqual(['tell_me_the_truth', 'hello']);
  expect(c.search('me')).toEqual(['tell_me_the_truth']);
});

test('CompletionImplementIdentifierUpperCamelCase', () => {
  const c = new CompletionImplementIdentifierUpperCamelCase();
  c.setCandidate(['hello', 'world', 'foo', 'bar', 'tell-me-the-truth']);

  expect(c.search(' ')).toEqual([]);

  expect(c.search('o')).toEqual(['Foo']);
  expect(c.search('oo')).toEqual(['Foo']);
  expect(c.search('HelloOo')).toEqual(['HelloFoo', 'Hello']);

  expect(c.search('Tell')).toEqual(['TellMeTheTruth', 'Hello']);
  expect(c.search('tell')).toEqual(['TellMeTheTruth', 'Hello']);
  expect(c.search('Me')).toEqual(['TellMeTheTruth']);
});

test('CompletionImplementIdentifierLowerCamelCase', () => {
  const c = new CompletionImplementIdentifierLowerCamelCase();
  c.setCandidate(['hello', 'world', 'foo', 'bar', 'tell-me-the-truth']);

  expect(c.search('o')).toEqual(['foo']);
  expect(c.search('helloOo')).toEqual(['helloFoo', 'hello']);

  expect(c.search('Tell')).toEqual(['tellMeTheTruth', 'hello']);
  expect(c.search('tell')).toEqual(['tellMeTheTruth', 'hello']);
  expect(c.search('Me')).toEqual(['tellMeTheTruth']);
});
