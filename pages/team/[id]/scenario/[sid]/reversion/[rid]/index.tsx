import { getTeamLayout } from '@/modules/team/TeamLayout';
import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import dynamic from 'next/dynamic';
import type { ScenarioDetail, ScenarioDetailPayload, ScenarioVersion } from '@/modules/team/types';
import omit from 'lodash/omit';

const Reversion = dynamic(() => import('@/modules/team/Scenario/Reversion'), { ssr: false });

/**
 * 业务场景具体版本首页
 * @returns
 */
export default function Scenario(props: { detail: ScenarioDetail }) {
  return <Reversion {...props} />;
}

export const getServerSideProps = withWakedataRequestSsr<{ detail: ScenarioDetail }>(async context => {
  const { sid, rid } = context.params as { sid: string; rid: string };

  // 获取业务场景详情
  const [detail, version] = await Promise.all([
    context.req.request<ScenarioDetailPayload>(
      '/wd/visual/web/business-scene/business-scene-detail-query',
      {
        id: sid,
      },
      { method: 'GET' }
    ),
    context.req.request<ScenarioVersion>(
      '/wd/visual/web/business-scene-version/business-scene-version-detail-query',
      {
        id: rid,
      },
      { method: 'GET' }
    ),
  ]);

  return {
    props: { detail: { version, ...omit(detail, 'businessSceneLatestVersion') } },
  };
});

Scenario.getLayout = getTeamLayout;
