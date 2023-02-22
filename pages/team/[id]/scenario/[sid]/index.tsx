import { getTeamLayout } from '@/modules/team/TeamLayout';
import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import dynamic from 'next/dynamic';
import { ScenarioDetail, ScenarioDetailPayload } from '@/modules/team/types';

const Reversion = dynamic(() => import('@/modules/team/Scenario/Reversion'), { ssr: false });

/**
 * 业务场景首页
 * @returns
 */
export default function Scenario(props: { detail: ScenarioDetail }) {
  return <Reversion {...props} />;
}

export const getServerSideProps = withWakedataRequestSsr<{ detail: ScenarioDetail }>(async context => {
  const { sid } = context.params as { sid: string };

  // 获取业务域详情
  const { businessSceneLatestVersion, ...other } = await context.req.request<ScenarioDetailPayload>(
    '/wd/visual/web/business-scene/business-scene-detail-query',
    {
      id: sid,
    },
    { method: 'GET' }
  );

  return {
    props: { detail: { ...other, version: businessSceneLatestVersion } },
  };
});

Scenario.getLayout = getTeamLayout;
