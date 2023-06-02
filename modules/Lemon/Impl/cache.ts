import { CacheStorageInMemory } from '../../storage';

export const Cache = new CacheStorageInMemory();

export function getCache<T>(key: string): T | undefined {
  return Cache.get(key) as T;
}

export function setCache<T>(key: string, value: T, expiredTime?: number) {
  return Cache.set(key, value, expiredTime);
}
