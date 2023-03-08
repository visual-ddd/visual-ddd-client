import { readRawData, toRawData } from './raw';

// base64 string
const BASE_64_DATA = 'aGVsbG8gd29ybGQ=';

describe('raw', () => {
  it('readRawData', () => {
    const raw = JSON.stringify({
      version: '1.0',
      data: BASE_64_DATA,
      timestamp: Date.now(),
    });

    const data = readRawData(raw);
    expect(data.toString('base64')).toBe(BASE_64_DATA);

    const data2 = readRawData(BASE_64_DATA);
    expect(data2.toString('base64')).toBe(BASE_64_DATA);
  });

  it('toRawData', () => {
    const data = Buffer.from(BASE_64_DATA, 'base64');
    const raw = toRawData(data);
    expect(JSON.parse(raw)).toEqual({
      version: '1.0',
      data: BASE_64_DATA,
      timestamp: expect.any(Number),
    });
  });
});
