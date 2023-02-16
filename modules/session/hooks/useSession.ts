import { IMMUTABLE_REQUEST_CONFIG, useRequestByGet } from '@/modules/backend-client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import type { VDSessionDetail } from '../types';

/**
 * 获取会话信息
 * @param options.redirectTo 当session 不存在时跳转的路径
 * @param options.immutable session 是否不可变，即是不拉取最新数据，默认 true
 *
 */
export function useSession(options?: { redirectTo?: string | URL; immutable?: boolean }) {
  const router = useRouter();
  const redirect = options?.redirectTo;
  const immutable = options?.immutable ?? true;
  const { data, isLoading } = useRequestByGet<VDSessionDetail>(
    '/api/session',
    undefined,
    immutable ? IMMUTABLE_REQUEST_CONFIG : undefined
  );

  useEffect(() => {
    if (data == null && !isLoading && redirect) {
      router.push(redirect);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isLoading]);

  return {
    session: data,
    isLoading,
  };
}
