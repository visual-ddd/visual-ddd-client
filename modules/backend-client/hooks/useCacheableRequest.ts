import { request } from '../request';
import { useSWRConfig } from 'swr';

// TODO: 实验性
export function useCacheableRequest() {
  const { cache } = useSWRConfig();

  const wrapper: typeof request.request = (key, body, config) => {
    const cacheState = cache.get(key);

    if (cacheState?.data && !cacheState.isLoading) {
      return cacheState.data;
    }

    return request.request(key, body, config);
  };

  return wrapper;
}
