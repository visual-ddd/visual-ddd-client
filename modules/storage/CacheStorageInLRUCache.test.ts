import { CacheStorageInLRUCache } from './CacheStorageInLRUCache';

describe('CacheStorageInLRUCache', () => {
  let cacheStorage: CacheStorageInLRUCache<number>;

  beforeEach(() => {
    cacheStorage = new CacheStorageInLRUCache({ max: 100 });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('set', () => {
    it('should set value to LRUCache without expiration', async () => {
      const key = 'key';
      const value = 123;

      await cacheStorage.set(key, value);
      expect(cacheStorage.get('key')).resolves.toBe(123);
    });

    it('should set value to LRUCache with expiration', async () => {
      const key = 'key';
      const value = 123;
      const now = Date.now();
      const expired = now + 5000;

      await cacheStorage.set(key, value, expired);

      // 正确设置这 ttl
      expect(cacheStorage.getRemainTTL(key) > 1000).toBeTruthy();

      await expect(cacheStorage.get('key')).resolves.toBe(123);
    });
  });
});
