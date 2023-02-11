import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import { getTeamLayout } from '@/modules/team/TeamLayout';
import { AppDetail, AppDetailPayload } from '@/modules/team/types';
import dynamic from 'next/dynamic';

const Reversion = dynamic(() => import('@/modules/team/App/Reversion'), { ssr: false });

/**
 * 应用首页
 * @returns
 */
export default function App(props: { detail: AppDetail }) {
  return <Reversion {...props} />;
}

export const getServerSideProps = withWakedataRequestSsr<{ detail: AppDetail }>(async context => {
  const { aid } = context.params as { aid: string };

  // 获取业务域详情
  const { applicationLatestVersion, ...other } = await context.req.request<AppDetailPayload>(
    '/wd/visual/web/application/application-detail-query',
    {
      id: aid,
    },
    { method: 'GET' }
  );

  return {
    props: { detail: { ...other, version: applicationLatestVersion } },
  };
});

App.getLayout = getTeamLayout;
