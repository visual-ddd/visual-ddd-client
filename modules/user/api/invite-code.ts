import { IRON_SESSION_OPTIONS } from '@/modules/session/config';
import { webcrypto } from 'crypto';

let cryptoKeyCache: CryptoKey | undefined;
let ivCache: Uint8Array | undefined;

export interface InviteInfo {
  /**
   * 类型
   */
  type: 'user';
  /**
   * id
   */
  id: string;
  /**
   * 时间戳，毫秒
   */
  date: number;
}

/**
 * 生成加密密钥
 * @returns
 */
export async function getKey() {
  if (cryptoKeyCache) {
    return cryptoKeyCache;
  }

  const rawKey = IRON_SESSION_OPTIONS.password as string;
  const keyBuffer = new TextEncoder().encode(rawKey).slice(0, 32);

  return (cryptoKeyCache = await webcrypto.subtle.importKey(
    'raw',
    keyBuffer,
    {
      name: 'AES-CBC',
    },
    false,
    ['encrypt', 'decrypt']
  ));
}

export async function getIv() {
  if (ivCache) {
    return ivCache;
  }

  const keyBuffer = new TextEncoder().encode(IRON_SESSION_OPTIONS.password as string);

  ivCache = keyBuffer.slice(0, 16);

  return ivCache;
}

/**
 * 创建邀请码
 * @param params
 */
export async function createInviteCode<T = InviteInfo>(params: InviteInfo) {
  const key = await getKey();
  const iv = await getIv();
  const data = JSON.stringify(params);
  const encode = new TextEncoder();

  const result = await webcrypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv,
    },
    key,
    encode.encode(data)
  );

  return Buffer.from(result).toString('hex');
}

/**
 * 解析邀请码
 * @param code
 * @returns
 * @throws
 */
export async function parseInviteCode(code: string): Promise<InviteInfo> {
  const key = await getKey();
  const iv = await getIv();
  const decode = new TextDecoder();
  const buffer = Buffer.from(code, 'hex');
  const result = await webcrypto.subtle.decrypt(
    {
      name: 'AES-CBC',
      iv,
    },
    key,
    buffer
  );

  const data = decode.decode(result);

  return JSON.parse(data);
}
