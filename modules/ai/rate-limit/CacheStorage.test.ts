import { CacheStorageInMemory } from './CacheStorage';

describe('CacheStorageInMemory', () => {
  let cacheStorage: CacheStorageInMemory<string>;

  beforeEach(() => {
    cacheStorage = new CacheStorageInMemory<string>();
  });

  it('should store and retrieve a value', async () => {
    const key = 'testKey';
    const value = 'testValue';

    await cacheStorage.set(key, value);
    const result = await cacheStorage.get(key);

    expect(result).toBe(value);
  });

  it('should return undefined for a non-existent key', async () => {
    const key = 'nonExistentKey';
    const result = await cacheStorage.get(key);

    expect(result).toBeUndefined();
  });

  it('should return undefined for an expired key', async () => {
    const key = 'expiredKey';
    const value = 'testValue';

    await cacheStorage.set(key, value, Date.now() - 1000);
    const result = await cacheStorage.get(key);

    expect(result).toBeUndefined();

    await cacheStorage.set(key, value, Date.now() + 1000);
    const result2 = await cacheStorage.get(key);
    expect(result2).toBe('testValue');
  });
});
