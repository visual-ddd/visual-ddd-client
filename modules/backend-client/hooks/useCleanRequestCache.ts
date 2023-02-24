import { useSWRConfig } from 'swr';

/**
 * 清空 swr 缓存
 * @returns
 */
export function useCleanRequestCache() {
  const { cache } = useSWRConfig();

  return () => {
    for (const k of cache.keys()) {
      cache.delete(k);
    }
  };
}
