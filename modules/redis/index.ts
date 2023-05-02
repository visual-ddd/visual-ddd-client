import { RedisClientType, createClient } from 'redis';

const url = process.env.REDIS;

let client: RedisClientType | undefined;

/**
 * 获取 redis 客户端
 * @returns
 */
export function getRedisClient() {
  if (client) {
    return client;
  }

  if (url) {
    client = createClient({
      url,
    });
  }
}
