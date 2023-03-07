// test assert
import { assert } from './assert';

describe('assert', () => {
  it('should throw error', () => {
    expect(() => {
      assert(false, 'error');
    }).toThrowError('error');
  });
});
