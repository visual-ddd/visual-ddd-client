import { assert } from '@/lib/utils';
import { Buffer } from 'node:buffer';
import { RedisClientType, commandOptions } from 'redis';
import { ICacheStorage } from './ICacheStorage';

export interface CacheStorageInRedisOptions {
  namespace: string;
  client: RedisClientType;
  /**
   * 是否作为二进制存储，默认为 false
   */
  binary?: boolean;

  /**
   * 默认存活时间，单位为毫秒
   */
  ttl?: number;
}

/**
 * Redis 缓存
 */
export class CacheStorageInRedis<T> implements ICacheStorage<T> {
  /**
   * KV 命名空间
   */
  private namespace: string;
  private binaryMode: boolean;
  private client: RedisClientType;
  private ttl?: number;

  setTTL(ttl: number) {
    this.ttl = ttl;
  }

  constructor(options: CacheStorageInRedisOptions) {
    this.namespace = options.namespace;
    this.client = options.client;
    this.binaryMode = options.binary ?? false;
    this.ttl = options.ttl;
  }

  async set(key: string, value: T, expired?: number): Promise<void> {
    const client = await this.getClient();
    const serialized = this.serialize(value);
    const ttl = this.getExpireTime(expired);
    const k = this.getKey(key);

    if (ttl != null && ttl > 0) {
      await client.setEx(k, ttl, serialized);
      return;
    }

    await client.set(k, serialized);
  }

  async get(key: string): Promise<T | undefined> {
    const client = await this.getClient();
    if (this.binaryMode) {
      const result = await client.get(
        commandOptions({
          returnBuffers: true,
        }),
        this.getKey(key)
      );

      return this.deserialize(result);
    } else {
      const result = await client.get(this.getKey(key));
      return this.deserialize(result);
    }
  }

  async has(key: string): Promise<boolean> {
    const client = await this.getClient();
    const result = await client.exists(this.getKey(key));

    return !!result;
  }

  async delete(key: string): Promise<boolean> {
    const client = await this.getClient();
    const result = await client.del(this.getKey(key));

    return !!result;
  }

  private serialize(value: T) {
    if (this.binaryMode) {
      assert(Buffer.isBuffer(value), 'value must be a buffer');
      return value;
    } else {
      assert(!Buffer.isBuffer(value), 'value must not be a buffer');
      return JSON.stringify(value);
    }
  }

  /**
   * 反序列化
   * @param value
   * @returns
   */
  private deserialize(value: unknown | null) {
    if (value == null) {
      return value;
    }

    if (this.binaryMode) {
      assert(Buffer.isBuffer(value), 'value must be a buffer');
      return value;
    } else {
      assert(typeof value === 'string', 'value must be a string');
      return JSON.parse(value);
    }
  }

  /**
   * @param expired 外部输入的毫秒时间戳
   * @return 返回秒
   */
  private getExpireTime(expired?: number) {
    if (expired != null && Number.isFinite(expired)) {
      const ex = expired - Date.now();
      return ex / 1000;
    }

    if (this.ttl != null) {
      return this.ttl / 1000;
    }
  }

  private getKey(key: string) {
    return `${this.namespace}:${key}`;
  }

  private async getClient() {
    if (this.client.isOpen) {
      return this.client;
    }

    await this.client.connect();

    return this.client;
  }
}
