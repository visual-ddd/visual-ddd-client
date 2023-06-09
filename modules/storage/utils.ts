import { getRedisClient } from '../redis';
import { CacheStorageInMemory } from './CacheStorageInMemory';
import { CacheStorageInRedis } from './CacheStorageInRedis';

export function getPersistenceCacheStorage<T>(namespace: string) {
  const client = getRedisClient();

  if (client == null) {
    console.warn('redis client is null, fallback to memory cache storage');
    return new CacheStorageInMemory<T>();
  }

  return new CacheStorageInRedis<T>({
    client,
    namespace,
  });
}
