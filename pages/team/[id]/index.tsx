import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import dynamic from 'next/dynamic';
import type { TeamHomeProps } from '@/modules/team/Team';
import type { TeamDetail } from '@/modules/organization/types';
import { getTeamLayout } from '@/modules/team/TeamLayout';

const TeamHome = dynamic(() => import('@/modules/team/Team'), { ssr: false });

/**
 * 团队首页
 * @returns
 */
export default function Team(props: TeamHomeProps) {
  return <TeamHome {...props} />;
}

Team.getLayout = getTeamLayout;

export const getServerSideProps = withWakedataRequestSsr<TeamHomeProps>(async context => {
  const { id } = context.params as { id: string };

  const detail = await context.req.request<TeamDetail>(
    '/wd/visual/web/team/team-detail-query',
    {
      id,
    },
    { method: 'GET' }
  );

  return {
    props: { detail },
  };
});
