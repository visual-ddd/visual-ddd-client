import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import { getTeamLayout } from '@/modules/team/TeamLayout';
import { AppDetail, AppDetailPayload, AppVersion } from '@/modules/team/types';
import dynamic from 'next/dynamic';

const Reversion = dynamic(() => import('@/modules/team/App/Reversion'), { ssr: false });

/**
 * 应用具体版本首页
 * @returns
 */
export default function App(props: { detail: AppDetail }) {
  return <Reversion {...props} />;
}

export const getServerSideProps = withWakedataRequestSsr<{ detail: AppDetail }>(async context => {
  const { aid, rid } = context.params as { aid: string; rid: string };

  // 获取应用详情
  const [detail, version] = await Promise.all([
    context.req.request<AppDetailPayload>(
      '/wd/visual/web/application/application-detail-query',
      {
        id: aid,
      },
      { method: 'GET' }
    ),
    context.req.request<AppVersion>(
      '/wd/visual/web/application-version/application-version-detail-query',
      {
        id: rid,
      },
      { method: 'GET' }
    ),
  ]);

  return {
    props: { detail: { ...detail, version: version } },
  };
});

App.getLayout = getTeamLayout;
