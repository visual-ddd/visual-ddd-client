import { toHex } from './hash';

test('toHex', () => {
  expect(toHex(new Uint8Array([0, 255, 16]))).toBe('00ff10');
});
