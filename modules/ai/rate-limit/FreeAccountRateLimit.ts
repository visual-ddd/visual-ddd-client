import { CacheContainer, ICacheStorage } from '@/modules/storage';
import { CountLimit } from './CountLimit';
import { IRateLimit } from './IRateLimit';

const COUNT_LIMIT = (() => {
  const fromEnv = process.env.FREE_ACCOUNT_COUNT_LIMIT;

  if (fromEnv) {
    const num = parseInt(fromEnv, 10);
    if (Number.isNaN(num)) {
      console.warn(`FREE_ACCOUNT_COUNT_LIMIT=${fromEnv} 不是有效的数字, 请检查`);
    } else {
      return Math.max(30, num);
    }
  }

  return 30;
})();
const TIMEOUT = Infinity;

/**
 * 免费用户请求限额
 * 永久 30 次
 */
export class FreeAccountRateLimit extends CacheContainer<CountLimit> implements IRateLimit {
  get exceedMessage() {
    return `试用版本只能发起 ${this.limit} 次会话，你可以使用私有化部署版本。`;
    // return `试用版本只能发起 ${this.limit} 次会话，你可以在用户信息页配置 API_KEY, 无限制使用。`
    // return `免费用户只能发起 ${this.limit} 次会话，你可以升级到付费套餐，无限制使用。`
  }

  constructor(private storage: ICacheStorage<object>, private limit = COUNT_LIMIT) {
    super({
      // TODO: 环境变量配置
      max: 200,
      ttl: TIMEOUT, // 1 分钟
      saveOnUpdate: (k, v) => {
        return v.count <= this.limit;
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
      count: this.limit,
    };
  }

  async remainUsage(id: string) {
    const limit = await this.request(id);

    return {
      count: limit.remain,
    };
  }

  protected async fetch(key: string): Promise<CountLimit> {
    const limit = new CountLimit(this.limit, TIMEOUT);
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
