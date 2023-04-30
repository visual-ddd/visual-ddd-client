import { CountLimit } from './CountLimit';

describe('CountLimit', () => {
  let countLimit: CountLimit;

  beforeEach(() => {
    countLimit = new CountLimit(5, 10000);
  });

  it('should return true when requests are within limit', () => {
    const result1 = countLimit.request();
    expect(result1).toBe(true);

    const result2 = countLimit.request();
    expect(result2).toBe(true);

    const result3 = countLimit.request();
    expect(result3).toBe(true);

    const result4 = countLimit.request();
    expect(result4).toBe(true);

    const result5 = countLimit.request();
    expect(result5).toBe(true);

    const result6 = countLimit.request();
    expect(result6).toBe(false);
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

  afterEach(() => {
    jest.clearAllTimers();
  });
});
