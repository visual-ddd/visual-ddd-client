import { CountWindowLimit } from './CountWindowLimit';

describe('CountLimit', () => {
  let countLimit: CountWindowLimit;

  beforeEach(() => {
    countLimit = new CountWindowLimit(5, 10000);
  });

  it('should return true when requests are within limit', () => {
    const result1 = countLimit.request();
    expect(result1).toBe(true);

    const result2 = countLimit.request();
    expect(result2).toBe(true);

    const result3 = countLimit.request();
    expect(result3).toBe(true);
  });

  it('should return false when requests exceed limit', () => {
    for (let i = 0; i < 5; i++) {
      countLimit.request();
    }

    const result = countLimit.request();
    expect(result).toBe(false);

    const result2 = countLimit.request();
    expect(result2).toBe(false);
  });

  it('should remove expired requests', () => {
    jest.useFakeTimers();
    countLimit.request();
    countLimit.request();

    jest.advanceTimersByTime(5000);

    expect(countLimit.count).toBe(2);

    countLimit.request();
    countLimit.request();

    expect(countLimit.count).toBe(4);

    jest.advanceTimersByTime(6000);

    expect(countLimit.request()).toBe(true);

    expect(countLimit.count).toBe(3);
    expect(countLimit.request()).toBe(true);
    expect(countLimit.request()).toBe(true);

    // 5 requests exceed limit
    expect(countLimit.request()).toBe(false);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });
});
