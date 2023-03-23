import { extraReferenceId, extraApi, parentType } from './extra-api';
import data from './extra-api.data.json';

describe('extraReferenceId', () => {
  it('should extract bracketed strings from a given string', () => {
    const str = 'This is a [1:test] string with [2:multiple] [3:bracketed] words';
    const expected = ['test', 'multiple', 'bracketed'];
    const result = extraReferenceId(str);
    expect(result).toEqual(expected);
  });

  it('should return an empty array if no bracketed strings are found', () => {
    const str = 'This is a test string without any bracketed words';
    const result = extraReferenceId(str);
    expect(result).toEqual([]);
  });
});

test('extraApi', () => {
  expect(extraApi(data as any)).toMatchSnapshot();
});

describe('parentType', () => {
  const identity = (name: string, id: string) => ({ id, name });

  it('should parse reference types correctly', () => {
    const result = parentType('string[ref:123]', identity);
    expect(result).toEqual(['string', { id: '123', name: 'ref' }]);
  });

  it('should throw an error for invalid types', () => {
    expect(() => parentType('string[ref:123', identity)).toThrowError('Invalid type: string[ref:123');
    expect(() => parentType('string[ref:123]]', identity)).toThrowError('Invalid type: string[ref:123]]');
    expect(() => parentType('string[ref:123]extra]', identity)).toThrowError('Invalid type: string[ref:123]extra]');
    expect(() => parentType('string[[ref:123][ref2:456]', identity)).toThrowError(
      'Invalid type: string[[ref:123][ref2:456]'
    );
  });

  it('should handle non-reference types', () => {
    const result = parentType('string', identity);
    expect(result).toEqual(['string']);
  });

  it('should handle multiple reference types', () => {
    const result = parentType('string[ref:123][ref2:456]', identity);
    expect(result).toEqual(['string', { id: '123', name: 'ref' }, { id: '456', name: 'ref2' }]);
  });
});
