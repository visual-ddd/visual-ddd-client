/**
 * @jest-environment node
 */
import { toHex, createShaHash } from './hash';

test('toHex', () => {
  expect(toHex(new Uint8Array([0, 255, 16]))).toBe('00ff10');
});

test('createShaHash', async () => {
  const hash = await createShaHash(new Uint8Array());
  expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

  const hash2 = await createShaHash(new Uint8Array());
  expect(hash).toBe(hash2);

  const hash3 = await createShaHash(new Uint8Array([0, 1, 2]));
  expect(hash3).toBe('ae4b3280e56e2faf83f414a6e3dabe9d5fbe18976544c05fed121accb85b53fc');
});
