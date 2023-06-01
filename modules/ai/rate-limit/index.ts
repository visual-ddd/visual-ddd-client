import { getRedisClient } from '@/modules/redis';
import memoize from 'lodash/memoize';
import { FreeAccountRateLimit } from './FreeAccountRateLimit';

import { AllSupportedModel } from '../constants';
import { GTP35RateLimit } from './GPT35RateLimit';
import { CacheStorageInMemory, CacheStorageInRedis } from '@/modules/storage';

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

/**
 * 免费账号限制
 */
export const getFreeAccountRateLimit = memoize(() => {
  const cacheStorage = getPersistenceCacheStorage<object>('free-account-rate-limit');

  return new FreeAccountRateLimit(cacheStorage);
});

/**
 * 模型基础速率限制
 */
export const getBasicModelRateLimit = memoize((model: AllSupportedModel) => {
  // TODO: 支持其他模型
  const cacheStorage = new CacheStorageInMemory<object>();
  return new GTP35RateLimit(cacheStorage);
});
