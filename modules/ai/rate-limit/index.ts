import memoize from 'lodash/memoize';
import { FreeAccountRateLimit } from './FreeAccountRateLimit';

import { CacheStorageInMemory, getPersistenceCacheStorage } from '@/modules/storage';
import { AllSupportedModel } from '../constants';
import { GTP35RateLimit } from './GPT35RateLimit';

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
