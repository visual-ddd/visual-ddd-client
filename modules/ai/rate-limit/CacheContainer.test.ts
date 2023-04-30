import { ISerializable } from '@/lib/utils';
import { CacheContainer } from './CacheContainer';

class T implements ISerializable<string> {
  value: string = '';

  toJSON(): string {
    return this.value;
  }

  fromJSON(data: string): void {
    this.value = data;
  }
}

const cache = new Map<string, [string, number]>();

class MyCache extends CacheContainer<T> {
  override async fetch(key: string) {
    const t = new T();
    if (cache.has(key)) {
      t.fromJSON(cache.get(key)![0]);
    }

    return t;
  }

  protected override save(key: string, value: T, expiredTime: number): void {
    cache.set(key, [value.toJSON(), expiredTime]);
  }
}

globalThis.performance.now = () => Date.now();

describe('CacheContainer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    globalThis.performance.now = () => {
      return Date.now();
    };
  });

  afterEach(() => {
    jest.runAllTimers();
    cache.clear();
  });

  test('挤占', async () => {
    const now = Date.now();
    const c = new MyCache({ ttl: 1000, max: 3 });

    const t1 = await c.request('1');
    t1.value = '1';
    const t2 = await c.request('2');
    t2.value = '2';
    const t3 = await c.request('3');
    t3.value = '3';

    const t4 = await c.request('4');
    t4.value = '4';

    // 写入缓存
    expect(cache.size).toBe(1);
    expect(cache.get('1')).toEqual(['1', now + 1000]);

    // 继续挤占
    await c.request('5');
    expect(cache.size).toBe(2);

    // 可以正常恢复
    const t1_ = await c.request('1');
    expect(t1_.value).toBe('1');
    const t2_ = await c.request('2');
    expect(t2_.value).toBe('2');
  });

  test('过期', async () => {
    const c = new MyCache({ ttl: 1000, max: 3 });

    const t1 = await c.request('1');
    t1.value = '1';

    expect((await c.request('1')).value).toBe('1');

    jest.advanceTimersByTime(1100);

    expect(c.getRemainTTL('1')).toBe(-100);
    // 已过期
    expect((await c.request('1')).value).toBe('');
  });

  test('更新时持久化', async () => {
    const c = new MyCache({ ttl: 1000, max: 3, saveOnUpdate: true, saveDebounce: 500 });

    const t1 = await c.request('1');
    t1.value = '1';
    expect(cache.size).toBe(0);

    jest.advanceTimersByTime(500);

    expect(c.getRemainTTL('1')).toBe(500);

    expect(cache.size).toBe(1);
    expect(cache.get('1')).toEqual(['1', Date.now() + 500]);

    // debounce
    const t2 = await c.request('2');
    t2.value = '2';
    jest.advanceTimersByTime(200);
    await c.request('2');
    expect(c.getRemainTTL('2')).toBe(1000);
    expect(cache.size).toBe(1);
    jest.advanceTimersByTime(500);
    expect(cache.size).toBe(2);
    expect(c.getRemainTTL('2')).toBe(500);
    expect(cache.get('2')).toEqual(['2', Date.now() + 500]);
  });
});
