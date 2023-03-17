import { getMappedColor, getMappedLighterColor } from './color';

test('test getMappedColor', () => {
  expect(getMappedColor('test')).toBe('#b36d3d');
  expect(getMappedColor('test')).toBe('#b36d3d');
  expect(getMappedColor('hello world')).toBe('#70b351');
});

test('test getMappedLighterColor', () => {
  expect(getMappedLighterColor('test')).toBe('#7FFFD4');
  expect(getMappedLighterColor('test')).toBe('#7FFFD4');

  expect(getMappedLighterColor('hello world')).toBe('#FFC0CB');
});
