/**
 * 存储在数据库的原始 Yjs 数据
 */
import { toUint8Array } from 'js-base64';
export type RawYjsData = string;

type Base64 = string;

interface RawPayload {
  version: '1.0';
  data: Base64;
  timestamp: number;
}

export function readRawData(raw: RawYjsData): Uint8Array {
  if (raw.startsWith('{') && raw.endsWith('}')) {
    // JSON 数据
    const payload: RawPayload = JSON.parse(raw);

    return toUint8Array(payload.data);
  } else {
    // 初版的 base64 数据
    return toUint8Array(raw);
  }
}
