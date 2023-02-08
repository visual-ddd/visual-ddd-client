import useSWR, { SWRConfiguration } from 'swr';
import type { RequestConfig } from '@wakeapp/wakedata-backend';
import { request } from '../request';

/**
 * wakedata-backend + swr
 * @param url
 * @param body
 * @param config
 * @returns
 */
export function useRequest<R = any, P extends {} = any>(
  url: string,
  body?: P,
  config?: RequestConfig & {
    swrConfig?: SWRConfiguration;
  }
) {
  return useSWR(
    url,
    async () => {
      const result = await request.request<R, P>(url, body, config);

      return result;
    },
    config?.swrConfig
  );
}
