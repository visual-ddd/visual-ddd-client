export interface ICacheStorage<T> {
  /**
   * 注意 expired 是一个时间戳(ms), 表示过期的时间点，可能为 Infinity
   */
  set(key: string, value: T, expired?: number): Promise<void>;
  get(key: string): Promise<T | undefined>;
}
