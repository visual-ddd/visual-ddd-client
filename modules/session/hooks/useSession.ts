import { useRequestByGet } from '@/modules/backend-client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import type { VDSessionDetail } from '../types';

/**
 * 获取会话信息
 * @param options.redirectTo 当session 不存在时跳转的路径
 *
 */
export function useSession(options?: { redirectTo?: string | URL }) {
  const router = useRouter();
  const redirect = options?.redirectTo;
  const { data, isLoading } = useRequestByGet<VDSessionDetail>('/api/session', undefined, {
    swrConfig: {
      revalidateOnMount: false,
      revalidateOnFocus: false,
    },
  });

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
