import { CacheContainer, ICacheStorage } from '@/modules/storage';
import { CountLimit } from './CountLimit';
import { IRateLimit } from './IRateLimit';

const COUNT_LIMIT = 30;
const TIMEOUT = Infinity;

/**
 * 免费用户请求限额
 * 永久 30 次
 */
export class FreeAccountRateLimit extends CacheContainer<CountLimit> implements IRateLimit {
  exceedMessage = `免费用户只能发起 ${COUNT_LIMIT} 次会话，你可以升级到付费套餐，无限制使用。`;
  constructor(private storage: ICacheStorage<object>) {
    super({
      // TODO: 环境变量配置
      max: 200,
      ttl: TIMEOUT, // 1 分钟
      saveOnUpdate: (k, v) => {
        return v.count <= COUNT_LIMIT;
      },
    });
  }

  /**
   * 是否允许调用
   * @param id
   * @param token
   * @returns
   */
  async requestUsage(id: string, count: number) {
    const limit = await this.request(id);

    return limit.request(count);
  }

  /**
   * 限制额度
   */
  limits() {
    return {
      count: COUNT_LIMIT,
    };
  }

  async remainUsage(id: string) {
    const limit = await this.request(id);

    return {
      count: limit.remain,
    };
  }

  protected async fetch(key: string): Promise<CountLimit> {
    const limit = new CountLimit(COUNT_LIMIT, TIMEOUT);
    const value = await this.storage.get(key);

    if (value) {
      limit.fromJSON(value as any);
    }

    return limit;
  }

  protected save(key: string, value: CountLimit, expired: number): void {
    this.storage.set(key, value.toJSON(), expired);
  }
}
