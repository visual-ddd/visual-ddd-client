import { readRawData } from './raw';
import { readRawData as nodeReadRawData } from '@/lib/yjs-store-api/raw';

// base64 string
const BASE_64_DATA = 'aGVsbG8gd29ybGQ=';

describe('raw', () => {
  it('readRawData', () => {
    const raw = JSON.stringify({
      version: '1.0',
      data: BASE_64_DATA,
      timestamp: Date.now(),
    });

    const data = Buffer.from(readRawData(raw));
    const dataNode = nodeReadRawData(raw);
    expect(data.toString('base64')).toBe(BASE_64_DATA);
    expect(dataNode.toString('base64')).toBe(data.toString('base64'));

    const data2 = Buffer.from(readRawData(BASE_64_DATA));
    expect(data2.toString('base64')).toBe(BASE_64_DATA);
  });
});
