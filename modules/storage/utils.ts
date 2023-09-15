import { getRedisClient } from '../redis';
import { CacheStorageInMemory } from './CacheStorageInMemory';
import { CacheStorageInRedis, CacheStorageInRedisOptions } from './CacheStorageInRedis';
import { CacheStorageInLRUCache, CacheStorageInLRUCacheOptions } from './CacheStorageInLRUCache';
import { assert } from '@/lib/utils';

/**
 * 获取持久化缓存存储
 * @param namespace
 * @param options
 * @returns
 */
export function getPersistenceCacheStorage<T>(options: {
  redisOptions: Omit<CacheStorageInRedisOptions, 'client'>;
  lruCacheOptions?: CacheStorageInLRUCacheOptions<T>;
  /**
   * 回退方式，默认 memory
   */
  fallback?: 'lru' | 'memory';
}) {
  const client = getRedisClient();

  if (client == null) {
    if (options.fallback === 'lru') {
      assert(options.lruCacheOptions, 'lruCacheOptions must be provided when fallback is lru');
      console.warn(`redis client is null, fallback to lru cache storage`);

      return new CacheStorageInLRUCache<T>(options.lruCacheOptions);
    }

    console.warn(`redis client is null, fallback to memory cache storage`);
    return new CacheStorageInMemory<T>();
  }

  return new CacheStorageInRedis<T>({
    ...options.redisOptions,
    client,
  });
}
