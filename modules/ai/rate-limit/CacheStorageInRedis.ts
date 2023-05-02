import { ICacheStorage } from './ICacheStorage';
import { RedisClientType } from 'redis';

export interface CacheStorageInRedisOptions {
  namespace: string;
  client: RedisClientType;
}

export class CacheStorageInRedis<T> implements ICacheStorage<T> {
  /**
   * KV 命名空间
   */
  private namespace: string;
  private client: RedisClientType;

  constructor(options: CacheStorageInRedisOptions) {
    this.namespace = options.namespace;
    this.client = options.client;
  }

  async set(key: string, value: T, expired?: number): Promise<void> {
    const client = await this.getClient();

    if (expired && Number.isFinite(expired)) {
      const ex = expired - Date.now();
      if (ex > 0) {
        await client.setEx(this.getKey(key), ex / 1000, JSON.stringify(value));
        return;
      }
    }

    await client.set(this.getKey(key), JSON.stringify(value));
  }

  async get(key: string): Promise<T | undefined> {
    const client = await this.getClient();
    const result = await client.get(this.getKey(key));

    if (result) {
      return JSON.parse(result);
    }
  }

  private getKey(key: string) {
    return `${this.namespace}:${key}`;
  }

  private async getClient() {
    if (this.client.isReady) {
      return this.client;
    }

    await this.client.connect();

    return this.client;
  }
}
