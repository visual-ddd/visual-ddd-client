import { CountLimit } from './CountLimit';

describe('CountLimit', () => {
  let countLimit: CountLimit;

  beforeEach(() => {
    countLimit = new CountLimit(5, 10000);
  });

  it('should return true when requests are within limit', () => {
    const result1 = countLimit.request();
    expect(result1).toBe(true);
    expect(countLimit.remain).toBe(4);

    const result2 = countLimit.request();
    expect(result2).toBe(true);
    expect(countLimit.remain).toBe(3);

    const result3 = countLimit.request();
    expect(result3).toBe(true);
    expect(countLimit.remain).toBe(2);

    const result4 = countLimit.request();
    expect(result4).toBe(true);
    expect(countLimit.remain).toBe(1);

    const result5 = countLimit.request();
    expect(result5).toBe(true);
    expect(countLimit.remain).toBe(0);

    const result6 = countLimit.request();
    expect(result6).toBe(false);
    expect(countLimit.remain).toBe(0);
  });

  it('should reset count after timeout', () => {
    jest.useFakeTimers();

    countLimit.request();
    countLimit.request();
    countLimit.request();
    countLimit.request();
    countLimit.request();

    expect(countLimit.request()).toBe(false);
    expect(countLimit.count).toBe(6);

    jest.advanceTimersByTime(11000);

    expect(countLimit.request()).toBe(true);
    expect(countLimit.count).toBe(1);
  });

  it('forever', () => {
    const c = new CountLimit(3, Infinity);
    expect(c.request()).toBe(true);
    expect(c.request()).toBe(true);
    expect(c.request()).toBe(true);
    expect(c.request()).toBe(false);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });
});
