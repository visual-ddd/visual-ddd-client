import { CacheContainer, ICacheStorage } from '@/modules/storage';
import { GPT35Limit } from './GPT35Limit';
import { IRateLimit } from './IRateLimit';

/**
 * GPT 3.5 速率限制
 */
export class GTP35RateLimit extends CacheContainer<GPT35Limit> implements IRateLimit {
  exceedMessage = `请求过于频繁，请稍后重试`;

  constructor(private storage: ICacheStorage<object>) {
    super({
      // TODO: 环境变量配置
      max: 1000,
      ttl: 60 * 1000, // 1 分钟
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

  protected async fetch(key: string): Promise<GPT35Limit> {
    const limit = new GPT35Limit();
    const value = await this.storage.get(key);

    if (value) {
      limit.fromJSON(value as any);
    }

    return limit;
  }

  protected save(key: string, value: GPT35Limit, expiredTime: number): void {
    this.storage.set(key, value.toJSON(), expiredTime);
  }
}
