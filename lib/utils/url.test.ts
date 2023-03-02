import { normalizeUrl } from './url';

test('normalizeUrl', () => {
  expect(normalizeUrl('https://example.com')).toBe('/');
  expect(normalizeUrl('https://example.com/')).toBe('/');
  expect(normalizeUrl('https://example.com/foo')).toBe('/foo');
  expect(normalizeUrl('https://example.com/foo/')).toBe('/foo/');
  expect(normalizeUrl('https://example.com/foo/bar')).toBe('/foo/bar');
  expect(normalizeUrl('https://example.com/foo/bar/')).toBe('/foo/bar/');
  expect(normalizeUrl('https://example.com/foo/bar?baz=qux')).toBe('/foo/bar?baz=qux');
  expect(normalizeUrl('https://example.com/foo/bar/?baz=qux')).toBe('/foo/bar/?baz=qux');
  expect(normalizeUrl('https://example.com/foo/bar#baz')).toBe('/foo/bar#baz');
  expect(normalizeUrl('https://example.com/foo/bar/#baz')).toBe('/foo/bar/#baz');
  expect(normalizeUrl('https://example.com/foo/bar?baz=qux#quux')).toBe('/foo/bar?baz=qux#quux');
  expect(normalizeUrl('https://example.com/foo/bar/?baz=qux#quux')).toBe('/foo/bar/?baz=qux#quux');
  expect(normalizeUrl('https://example.com/foo/bar?baz=qux#')).toBe('/foo/bar?baz=qux');
  expect(normalizeUrl('https://example.com/foo/bar/?baz=qux#')).toBe('/foo/bar/?baz=qux');
  expect(normalizeUrl('https://example.com/foo/bar?baz=qux#quux')).toBe('/foo/bar?baz=qux#quux');
  expect(normalizeUrl('https://example.com/foo/bar/?baz=qux#quux')).toBe('/foo/bar/?baz=qux#quux');
  expect(normalizeUrl('https://example.com/foo/bar?baz=qux#')).toBe('/foo/bar?baz=qux');
  expect(normalizeUrl('https://example.com/foo/bar/?baz=qux#')).toBe('/foo/bar/?baz=qux');
  expect(normalizeUrl('https://example.com/foo/bar?baz=qux#quux')).toBe('/foo/bar?baz=qux#quux');
  expect(normalizeUrl('/foo/bar?baz=qux#quux')).toBe('/foo/bar?baz=qux#quux');
  expect(normalizeUrl('hello')).toBe('/hello');
});
