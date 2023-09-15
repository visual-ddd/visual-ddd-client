import memoize from 'lodash/memoize';
import { FreeAccountRateLimit } from './FreeAccountRateLimit';

import { CacheStorageInMemory, getPersistenceCacheStorage } from '@/modules/storage';
import { AllSupportedModel, ChatModel } from '../constants';
import { GTP35RateLimit } from './GPT35RateLimit';
import { GTP4RateLimit } from './GPT4RateLimit';

/**
 * 免费账号限制
 * 仅支持终生 30 次请求
 */
export const getFreeAccountRateLimit = memoize(() => {
  const cacheStorage = getPersistenceCacheStorage<object>({ redisOptions: { namespace: 'free-account-rate-limit' } });

  return new FreeAccountRateLimit(cacheStorage);
});

/**
 * 模型基础速率限制
 */
export const getBasicModelRateLimit = memoize((model: AllSupportedModel) => {
  // TODO: 支持其他模型
  const cacheStorage = new CacheStorageInMemory<object>();

  if (model === ChatModel.GPT_4 || model === ChatModel.GPT_4_32K) {
    return new GTP4RateLimit(cacheStorage);
  }

  // 默认 3.5
  return new GTP35RateLimit(cacheStorage);
});
