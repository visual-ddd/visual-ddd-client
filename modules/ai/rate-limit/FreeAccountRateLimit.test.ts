import { CacheStorageInMemory } from './CacheStorage';
import { FreeAccountRateLimit } from './FreeAccountRateLimit';

test('FreeAccountRateLimit', async () => {
  const cache = new CacheStorageInMemory<object>();
  const rateLimit = new FreeAccountRateLimit(cache);

  expect(await rateLimit.allow('1', 1)).toBe(true);
  expect(await rateLimit.allow('1', 29)).toBe(true);
  expect(await rateLimit.allow('1', 2)).toBe(false);
  expect(await rateLimit.allow('1', 2)).toBe(false);

  expect(await cache.get('1')).toEqual({
    count: 30,
    lastUpdated: 0,
  });
});
