import { IMMUTABLE_REQUEST_CONFIG, useRequestByGet } from '@/modules/backend-client';
import { TeamDetail } from '@/modules/organization/types';
import { useRouter } from 'next/router';

/**
 * 获取团队信息
 * @returns
 */
export function useTeamInfo() {
  const router = useRouter();
  const teamId = router.query.id as string | undefined;

  const result = useRequestByGet<TeamDetail>(
    router.isReady ? `/wd/visual/web/team/team-detail-query?id=${teamId}` : null,
    undefined,
    IMMUTABLE_REQUEST_CONFIG
  );

  return {
    teamId,
    ...result,
  };
}
