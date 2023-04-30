import { AmountWindowLimit } from './AmountWindowLimit';

describe('AmountLimit', () => {
  let amountLimit: AmountWindowLimit;

  beforeEach(() => {
    amountLimit = new AmountWindowLimit(10, 10000);
  });

  it('should return true when requests are within limit', () => {
    const result1 = amountLimit.request(3);
    expect(result1).toBe(true);
    expect(amountLimit.remain).toBe(7);

    const result2 = amountLimit.request(4);
    expect(result2).toBe(true);
    expect(amountLimit.remain).toBe(3);

    const result3 = amountLimit.request(2);
    expect(result3).toBe(true);
    expect(amountLimit.remain).toBe(1);

    const result4 = amountLimit.request(2);
    expect(result4).toBe(false);
    expect(amountLimit.remain).toBe(1);

    const result5 = amountLimit.request(1);
    expect(result5).toBe(true);
    expect(amountLimit.remain).toBe(0);

    const result6 = amountLimit.request(1);
    expect(result6).toBe(false);
  });

  it('should return false when requests exceed limit', () => {
    const result1 = amountLimit.request(5);
    expect(result1).toBe(true);

    const result2 = amountLimit.request(6);
    expect(result2).toBe(false);
  });

  it('should remove expired requests', () => {
    jest.useFakeTimers();

    amountLimit.request(3);
    amountLimit.request(4);

    jest.advanceTimersByTime(5000);

    amountLimit.request(2);

    jest.advanceTimersByTime(5000);

    const result = amountLimit.request(2);
    expect(result).toBe(true);
    expect(amountLimit.remain).toBe(6);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });
});
