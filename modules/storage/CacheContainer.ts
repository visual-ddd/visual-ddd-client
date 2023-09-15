import { ISerializable } from '@/lib/utils';
import debounce from 'lodash/debounce';
import LRUCache from 'lru-cache';

export interface CacheContainerOptions<T extends ISerializable<any>> {
  /**
   * 存活时间
   * 通常 GPT 3.5 的存活时间是 1 分钟
   * 通常 GPT 4 的存活时间是 3 小时
   */
  ttl: number;

  /**
   * 最大数量
   * 到达这个数量后, 就算没有过期的内容也会被清除，我们可以写入到磁盘或者 redis 中
   */
  max: number;

  /**
   * 是否在更新的时候进行持久化, 默认 false
   * 对于重要的、长期的数据应该进行持久化，避免对视
   */
  saveOnUpdate?: boolean | ((key: string, value: T) => boolean);

  /**
   * saveOnUpdate debounce
   * 默认使用 queueMicrotask
   */
  saveDebounce?: number;
}

/**
 * 缓存容器
 * 按照一定的策略对缓存进行管理
 * TODO: 支持 redis
 * @deprecated 使用该类会导致服务程序无法伸缩，因为状态会存储在当前实例，会导致实例之间的状态不一致
 *
 * @template T 缓存的内容
 */
export abstract class CacheContainer<T extends ISerializable<any>> {
  private cache: LRUCache<string, T>;
  private options: CacheContainerOptions<T>;

  constructor(options: CacheContainerOptions<T>) {
    this.options = options;

    this.cache = new LRUCache({
      max: options.max,
      ttl: Number.isFinite(options.ttl) ? options.ttl : undefined,

      // 获取操作也会更新缓存的存活时间
      updateAgeOnGet: true,
      updateAgeOnHas: true,

      allowStale: false,

      fetchMethod: key => {
        return this.fetch(key);
      },

      dispose: (value, key, reason) => {
        if (reason === 'evict') {
          // 被挤占，进行持久化
          const ttl = this.cache.getRemainingTTL(key);
          const expiredTimestamp = Date.now() + ttl;

          this.save(key, value, expiredTimestamp);
        }
      },
    });

    let originRequestSave = this.requestSave.bind(this);

    if (this.options.saveDebounce != null) {
      this.requestSave = debounce(originRequestSave, this.options.saveDebounce);
    } else {
      this.requestSave = (id: string) =>
        queueMicrotask(() => {
          originRequestSave(id);
        });
    }
  }

  // 恢复或者创建缓存
  // 自行决定过期时间
  protected abstract fetch(key: string): Promise<T>;

  // 持久化
  protected abstract save(key: string, value: T, expiredTime: number): void;

  /**
   * 获取资源
   * @param id
   */
  async request(id: string): Promise<T> {
    const data = (await this.cache.fetch(id)) as T;

    if (
      typeof this.options.saveOnUpdate === 'function' ? this.options.saveOnUpdate(id, data) : this.options.saveOnUpdate
    ) {
      this.requestSave(id);
    }

    return data;
  }

  pick(id: string) {
    return this.cache.get(id);
  }

  getRemainTTL(id: string) {
    return this.cache.getRemainingTTL(id);
  }

  /**
   * 持久化数据
   * @param id
   */
  private requestSave(id: string) {
    const value = this.cache.peek(id);

    if (value) {
      const ttl = this.cache.getRemainingTTL(id);
      const expiredTimestamp = Date.now() + ttl;

      this.save(id, value, expiredTimestamp);
    }
  }
}
