import type { RedisClientType } from 'redis';
import { CacheStorageInRedis } from './CacheStorageInRedis';

export interface CacheStorageInRedisOptions {
  namespace: string;
  client: RedisClientType;
  /**
   * 是否作为二进制存储，默认为 false
   */
  binary?: boolean;
}

describe('CacheStorageInRedis', () => {
  let cacheStorage: CacheStorageInRedis<number>;
  let cacheStorageBinary: CacheStorageInRedis<Buffer>;
  let client: RedisClientType;

  beforeEach(() => {
    client = {
      isOpen: true,
      connect: jest.fn(),
      set: jest.fn(),
      setEx: jest.fn(),
      get: jest.fn(),
    } as unknown as RedisClientType;
    cacheStorage = new CacheStorageInRedis({ namespace: 'test', client });
    cacheStorageBinary = new CacheStorageInRedis({ namespace: 'test', client, binary: true });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('set', () => {
    it('should throw error when data type is not matched', () => {
      expect(cacheStorage.set('key', Buffer.from('') as any)).rejects.toThrow('value must not be a buffer');

      expect(cacheStorageBinary.set('key', 1 as any)).rejects.toThrow('value must be a buffer');
    });

    it('should set value to Redis without expiration', async () => {
      const key = 'key';
      const value = 123;

      await cacheStorage.set(key, value);

      expect(client.set).toHaveBeenCalledWith('test:key', '123');
    });

    it('should set value to Redis with expiration', async () => {
      const key = 'key';
      const value = 123;
      const expired = Date.now() + 5000;

      await cacheStorage.set(key, value, expired);

      expect(client.setEx).toHaveBeenCalledWith('test:key', 5, '123');
    });

    it('should not set value to Redis if expired time is in the past', async () => {
      const key = 'key';
      const value = 123;
      const expired = Date.now() - 5000;

      await cacheStorage.set(key, value, expired);

      expect(client.set).toHaveBeenCalledWith('test:key', '123');
      expect(client.setEx).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should get value from Redis', async () => {
      const key = 'key';

      (client.get as jest.Mock).mockResolvedValue('123');

      const result = await cacheStorage.get(key);

      expect(client.get).toHaveBeenCalledWith('test:key');
      expect(result).toBe(123);
    });

    it('should return buffer', async () => {
      const key = 'key';

      (client.get as jest.Mock).mockResolvedValue(Buffer.from(''));

      const result = await cacheStorageBinary.get(key);

      expect(client.get).toHaveBeenCalledWith('test:key');
      expect(Buffer.isBuffer(result)).toBeTruthy();
    });

    it('should return undefined if value is not found in Redis', async () => {
      const key = 'key';

      (client.get as jest.Mock).mockResolvedValue(null);

      const result = await cacheStorage.get(key);

      expect(client.get).toHaveBeenCalledWith('test:key');
      expect(result).toBeNull();
    });
  });
});
