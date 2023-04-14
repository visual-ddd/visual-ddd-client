import { IGNORE_AUTH_ERROR, IMMUTABLE_REQUEST_CONFIG, useRequestByGet, request } from '@/modules/backend-client';
import { useEffect } from 'react';

import type { VDSessionDetail } from '../types';

let inMemoryCache: VDSessionDetail | undefined;

/**
 * 获取会话信息
 * @param options.shouldRedirect 默认为 true, 当会话不存在时默认会跳转到登录页面
 * @param options.immutable session 是否不可变，即是不拉取最新数据，默认 true
 *
 */
export function useSession(options?: { shouldRedirect?: boolean; immutable?: boolean }) {
  const redirect = options?.shouldRedirect ?? true;
  const immutable = options?.immutable ?? true;

  const { data, isLoading, mutate } = useRequestByGet<VDSessionDetail>('/api/session', undefined, {
    swrConfig: {
      ...(immutable
        ? IMMUTABLE_REQUEST_CONFIG.swrConfig
        : {
            revalidateOnFocus: false,
          }),
      shouldRetryOnError: false,
    },
    meta: {
      // 忽略 401 重定向
      [IGNORE_AUTH_ERROR]: !redirect,
    },
  });

  const reload = () => {
    mutate();
  };

  useEffect(() => {
    inMemoryCache = data;
  }, [data]);

  return {
    session: data,
    reload,
    isLoading,
  };
}

/**
 * 获取用户会话信息，用于在组件树之外获取
 * @returns
 */
export async function getSession() {
  if (inMemoryCache) {
    return inMemoryCache;
  }

  const res = await request.requestByGet<VDSessionDetail>('/api/session');

  return res;
}
