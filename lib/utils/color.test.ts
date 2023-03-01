import { getMappedColor } from './color';

test('test getMappedColor', () => {
  expect(getMappedColor('test')).toBe('#b36d3d');
  expect(getMappedColor('test')).toBe('#b36d3d');
  expect(getMappedColor('hello world')).toBe('#70b351');
});
