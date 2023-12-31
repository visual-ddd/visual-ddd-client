import { ICacheStorage } from './ICacheStorage';

/**
 * 内存缓存
 */
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

  async has(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  async delete(key: string): Promise<boolean> {
    return this.storage.delete(key);
  }
}
