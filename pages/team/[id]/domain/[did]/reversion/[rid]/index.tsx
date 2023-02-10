import { getTeamLayout } from '@/modules/team/TeamLayout';
import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import dynamic from 'next/dynamic';
import type { DomainDetail, DomainDetailPayload, DomainVersion } from '@/modules/team/types';
import omit from 'lodash/omit';

const Reversion = dynamic(() => import('@/modules/team/Domain/Reversion'), { ssr: false });

/**
 * 业务域具体版本首页
 * @returns
 */
export default function Domain(props: { detail: DomainDetail }) {
  return <Reversion {...props} />;
}

export const getServerSideProps = withWakedataRequestSsr<{ detail: DomainDetail }>(async context => {
  const { did, rid } = context.params as { did: string; rid: string };

  // 获取业务域详情
  const [detail, version] = await Promise.all([
    context.req.request<DomainDetailPayload>(
      '/wd/visual/web/domain-design/domain-design-detail-query',
      {
        id: did,
      },
      { method: 'GET' }
    ),
    context.req.request<DomainVersion>(
      '/wd/visual/web/domain-design-version/domain-design-version-detail-query',
      {
        id: rid,
      },
      { method: 'GET' }
    ),
  ]);

  return {
    props: { detail: { version, ...omit(detail, 'domainDesignLatestVersion') } },
  };
});

Domain.getLayout = getTeamLayout;
