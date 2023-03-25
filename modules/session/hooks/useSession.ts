import { IGNORE_AUTH_ERROR, IMMUTABLE_REQUEST_CONFIG, useRequestByGet } from '@/modules/backend-client';

import type { VDSessionDetail } from '../types';

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
      ...(immutable ? IMMUTABLE_REQUEST_CONFIG.swrConfig : undefined),
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

  return {
    session: data,
    reload,
    isLoading,
  };
}
