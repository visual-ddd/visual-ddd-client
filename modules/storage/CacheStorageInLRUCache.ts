import LRUCache from 'lru-cache';
import { ICacheStorage } from './ICacheStorage';

export type CacheStorageInLRUCacheOptions<T> = LRUCache.Options<string, T, unknown>;

/**
 * 内存缓存
 */
export class CacheStorageInLRUCache<T> implements ICacheStorage<T> {
  private storage: LRUCache<string, any, unknown>;

  constructor(options: CacheStorageInLRUCacheOptions<T>) {
    this.storage = new LRUCache(options as any);
  }

  async set(key: string, value: T, expired?: number): Promise<void> {
    const ttl = expired && expired - Date.now();
    this.storage.set(key, value, {
      ttl,
    });
  }

  async get(key: string): Promise<T | undefined> {
    return this.storage.get(key, { allowStale: false });
  }

  getRemainTTL(key: string) {
    return this.storage.getRemainingTTL(key);
  }
}
