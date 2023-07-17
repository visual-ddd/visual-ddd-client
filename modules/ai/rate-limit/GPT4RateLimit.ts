import { CacheContainer, ICacheStorage } from '@/modules/storage';
import { GPT4Limit } from './GPT4Limit';
import { IRateLimit } from './IRateLimit';

/**
 * GPT 4 速率限制
 */
export class GTP4RateLimit extends CacheContainer<GPT4Limit> implements IRateLimit {
  exceedMessage = `请求过于频繁，请稍后重试`;

  constructor(private storage: ICacheStorage<object>) {
    super({
      // TODO: 环境变量配置
      max: 1000,
      ttl: 60 * 1000 * 60 * 3, // 3 hours
    });
  }

  /**
   * 是否允许调用
   * @param id
   * @param token
   * @returns
   */
  async requestUsage(id: string, token: number) {
    const limit = await this.request(id);

    return limit.request(token);
  }

  /**
   * 剩余配额
   * @param id
   * @returns
   */
  async remainUsage(id: string) {
    const limit = await this.request(id);

    return limit.remain;
  }

  protected async fetch(key: string): Promise<GPT4Limit> {
    const limit = new GPT4Limit();
    const value = await this.storage.get(key);

    if (value) {
      limit.fromJSON(value as any);
    }

    return limit;
  }

  protected save(key: string, value: GPT4Limit, expiredTime: number): void {
    this.storage.set(key, value.toJSON(), expiredTime);
  }
}
