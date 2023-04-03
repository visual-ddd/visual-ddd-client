import { useRouter } from 'next/router';
import { isEntry as checkIsEntry, normalizeLaunchInfo, verifyRedirect } from './utils';
import { useEffect, useMemo } from 'react';
import { useRequestByPost } from '@/modules/backend-client';
import { IMMUTABLE_REQUEST_CONFIG, request } from '@/modules/backend-client';
import { LaunchInfo } from './types';
import { TeamDetail } from '@/modules/organization/types';

const getTeamInfo = async (teamId: string | number) => {
  return request.requestByGet<TeamDetail>('/wd/visual/web/team/team-detail-query', { id: teamId });
};

/**
 * 检查用户权限
 */
export function useVerifyPermission() {
  const router = useRouter();
  const path = router.isReady ? router.asPath : undefined;
  const isEntry = useMemo(() => {
    if (!path) {
      return false;
    }

    return checkIsEntry(path);
  }, [path]);

  // 获取启动信息
  const launchInfo = useRequestByPost<LaunchInfo>(
    isEntry ? '/wd/visual/web/account/login/get-account-role' : null,
    {},
    IMMUTABLE_REQUEST_CONFIG
  );

  useEffect(() => {
    if (launchInfo.data == null || !isEntry || !path) {
      return;
    }

    const info = normalizeLaunchInfo(launchInfo.data);

    // 检查
    let disposed = false;
    const verify = async () => {
      const state = await verifyRedirect(path, info, getTeamInfo);
      if (disposed) {
        return;
      }

      if (state == null) {
        // 需要重定向到启动页
        router.push('/launch');
      }
    };

    verify();

    return () => {
      disposed = true;
    };
  }, [launchInfo.data, isEntry, path]);
}
