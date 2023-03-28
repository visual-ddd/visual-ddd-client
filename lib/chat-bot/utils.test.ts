import { extraMention } from './util';

describe('extraMention', () => {
  it('should return the extra mention', () => {
    expect(extraMention('#world#')).toBe('world');
    expect(extraMention('#world ')).toBe('world');
    expect(extraMention('#world#hello ')).toBe('world');
    expect(extraMention('world#hello ')).toBe(null);
    expect(extraMention('world#hello# ')).toBe(null);
  });
});
