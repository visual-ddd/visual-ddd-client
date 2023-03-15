import { PreviewPageLayout, PreviewPageSection } from '@/lib/components/PreviewPageLayout';
import { useLayoutTitle } from '@/modules/Layout';
import { TeamDetail } from '@/modules/organization/types';
import { Card, Statistic } from 'antd';
import { useRouter } from 'next/router';
import { useTeamLayoutModel } from '../TeamLayout';
import s from './index.module.scss';

export * from './useTeamInfo';

export interface TeamHomeProps {
  detail: TeamDetail;
}

/**
 * 团队首页
 */
export function TeamHome(props: TeamHomeProps) {
  const router = useRouter();
  const { detail } = props;
  const teamId = detail.id;
  const model = useTeamLayoutModel();

  useLayoutTitle(`团队概览(${detail.name})`);

  return (
    <PreviewPageLayout
      className={s.root}
      stats={
        <>
          <Card
            bordered
            size="small"
            className="u-pointer"
            onClick={() => {
              router.push(`/team/${teamId}/domain`);
            }}
          >
            <Statistic value={model?.domainList.length ?? 0} title="业务域"></Statistic>
          </Card>
          <Card
            bordered
            size="small"
            className="u-pointer"
            onClick={() => {
              router.push(`/team/${teamId}/scenario`);
            }}
          >
            <Statistic value={model?.scenarioList.length ?? 0} title="业务场景"></Statistic>
          </Card>
          <Card
            bordered
            size="small"
            className="u-pointer"
            onClick={() => {
              router.push(`/team/${teamId}/app`);
            }}
          >
            <Statistic value={model?.appList.length ?? 0} title="应用"></Statistic>
          </Card>
        </>
      }
      left={
        <>
          <Card size="small" title="简介">
            <PreviewPageSection name="描述">{detail.description || '未配置描述'}</PreviewPageSection>
            <PreviewPageSection name="所属组织">{detail.organizationDTO?.name}</PreviewPageSection>
          </Card>
        </>
      }
    ></PreviewPageLayout>
  );
}

export default TeamHome;
