import useSWR, { SWRConfiguration } from 'swr';
import type { RequestConfig, PaginationParams } from '@wakeapp/wakedata-backend';
import { request } from '../request';

export interface UseRequestConfig extends RequestConfig {
  swrConfig?: SWRConfiguration;
}

export const IMMUTABLE_REQUEST_CONFIG: UseRequestConfig = {
  swrConfig: {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  },
};

/**
 * wakedata-backend + swr
 * @param url
 * @param body
 * @param config
 * @returns
 */
export function useRequest<R = any, P extends {} = any>(url: string | null, body?: P, config?: UseRequestConfig) {
  return useSWR(
    url,
    async () => {
      const result = await request.request<R, P>(url!, body, config);

      return result;
    },
    config?.swrConfig
  );
}

/**
 * wakedata-backend pagination + swr
 * @param url
 * @param body
 * @param config
 * @returns
 */
export function useRequestPagination<R = any, P extends PaginationParams = any>(
  url: string | null,
  body?: P,
  config?: UseRequestConfig
) {
  return useSWR(
    url,
    async () => {
      const result = await request.requestByPagination<R, P>(url!, body, config);

      return result;
    },
    config?.swrConfig
  );
}
