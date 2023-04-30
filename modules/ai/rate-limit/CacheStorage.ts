export interface ICacheStorage<T> {
  // 注意 expired 是一个时间戳，可能为 Infinity
  set(key: string, value: T, expired?: number): Promise<void>;
  get(key: string): Promise<T | undefined>;
}

export class CacheStorageInMemory<T> implements ICacheStorage<T> {
  private storage = new Map<string, [T, number | undefined]>();

  async set(key: string, value: T, expired?: number): Promise<void> {
    this.storage.set(key, [value, expired]);
  }

  async get(key: string): Promise<T | undefined> {
    const data = this.storage.get(key);

    if (data) {
      const [v, e] = data;
      if (e == null || e > Date.now()) {
        return v;
      }
    }
  }
}

// TODO: redis
