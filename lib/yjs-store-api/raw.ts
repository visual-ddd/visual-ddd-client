/**
 * 存储在数据库的原始 Yjs 数据
 */
export type RawYjsData = string;

type Base64 = string;

interface RawPayload {
  version: '1.0';
  data: Base64;
  timestamp: number;
}

export function readRawData(raw: RawYjsData): Buffer {
  if (raw.startsWith('{') && raw.endsWith('}')) {
    // JSON 数据
    const payload: RawPayload = JSON.parse(raw);

    return Buffer.from(payload.data, 'base64');
  } else {
    // 初版的 base64 数据
    return Buffer.from(raw, 'base64');
  }
}

export function toRawData(data: Buffer): RawYjsData {
  const payload: RawPayload = {
    version: '1.0',
    data: data.toString('base64'),
    timestamp: Date.now(),
  };

  return JSON.stringify(payload);
}
