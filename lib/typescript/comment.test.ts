import { generateComment } from './comment';

describe('comment', () => {
  it('should return empty string when no comments are provided', () => {
    expect(generateComment([], 'block')).toBe('');
  });

  it('should return block comment when style is block', () => {
    const lines = ['This is a comment', 'This is another comment', '', undefined];
    const expectedOutput = `/**
 * This is a comment
 * This is another comment
 */`;
    expect(generateComment(lines, 'block')).toBe(expectedOutput);
  });

  it('should return inline comment when style is inline', () => {
    const lines = ['This is a comment', 'This is another comment'];
    const expectedOutput = `// This is a comment
// This is another comment`;
    expect(generateComment(lines, 'inline')).toBe(expectedOutput);
  });
});
