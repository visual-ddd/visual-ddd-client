import { fromUint8Array } from 'js-base64';

export async function createShaHash(data: Uint8Array) {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return fromUint8Array(new Uint8Array(digest));
}
