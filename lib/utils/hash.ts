export function toHex(data: Uint8Array) {
  return Array.from(data)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create a SHA-256 hash of the given data.
 * @param data
 * @returns
 */
export async function createShaHash(data: Uint8Array) {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return toHex(new Uint8Array(digest));
}
