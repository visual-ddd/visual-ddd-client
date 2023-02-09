import { getTeamLayout } from '@/modules/team/TeamLayout';
import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import dynamic from 'next/dynamic';
import { DomainDetail } from '@/modules/team/types';

const Reversion = dynamic(() => import('@/modules/team/Domain/Reversion'), { ssr: false });

/**
 * 业务域版本首页
 * @returns
 */
export default function Domain(props: { detail: DomainDetail }) {
  return <Reversion {...props} />;
}

export const getServerSideProps = withWakedataRequestSsr<{ detail: DomainDetail }>(async context => {
  const { did } = context.params as { did: string };

  // 获取业务域详情
  const detail = await context.req.request<DomainDetail>(
    '/wd/visual/web/domain-design/domain-design-detail-query',
    {
      id: did,
    },
    { method: 'GET' }
  );

  return {
    props: { detail },
  };
});

Domain.getLayout = getTeamLayout;
