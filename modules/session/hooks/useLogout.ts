import { request, useCleanRequestCache } from '@/modules/backend-client';
import { useRouter } from 'next/router';

/**
 * 退出登录
 * @returns
 */
export function useLogout() {
  const router = useRouter();
  const cleanSWRCache = useCleanRequestCache();

  const logout = async () => {
    await request.requestByPost('/api/logout');

    cleanSWRCache();

    router.push('/login');
  };

  return logout;
}
