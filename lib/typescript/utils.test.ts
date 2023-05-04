import { indent } from './utils';

describe('indent', () => {
  it('should indent code with specified count', () => {
    const code = 'const a = 1;\nconst b = 2;';
    const expected = '  const a = 1;\n  const b = 2;';
    expect(indent(code, 1)).toEqual(expected);
  });

  it('should not indent empty code', () => {
    const code = '';
    const expected = '';
    expect(indent(code, 2)).toEqual(expected);
  });

  it('should not indent code with count of 0', () => {
    const code = 'const a = 1;\nconst b = 2;';
    const expected = 'const a = 1;\nconst b = 2;';
    expect(indent(code, 0)).toEqual(expected);
  });
});
