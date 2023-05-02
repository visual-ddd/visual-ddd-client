import { CacheStorageInMemory } from './CacheStorageInMemory';
import { FreeAccountRateLimit } from './FreeAccountRateLimit';

test('FreeAccountRateLimit', async () => {
  const cache = new CacheStorageInMemory<object>();
  const rateLimit = new FreeAccountRateLimit(cache);

  expect(await rateLimit.requestUsage('1', 1)).toBe(true);
  expect(await rateLimit.remainUsage('1')).toEqual({ count: 29 });
  expect(await rateLimit.requestUsage('1', 29)).toBe(true);
  expect(await rateLimit.remainUsage('1')).toEqual({ count: 0 });
  expect(await rateLimit.requestUsage('1', 2)).toBe(false);
  expect(await rateLimit.requestUsage('1', 2)).toBe(false);

  expect(await cache.get('1')).toEqual({
    count: 30,
    lastUpdated: 0,
  });
});
