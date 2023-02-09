import { useRequest } from './useRequest';

/**
 * GET 请求
 * @param url
 * @param body
 * @param config
 * @returns
 */
export const useRequestByGet: typeof useRequest = (url, body, config) => {
  return useRequest(url, body, {
    ...config,
    method: 'GET',
  });
};
