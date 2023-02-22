import { getTeamLayout } from '@/modules/team/TeamLayout';
import dynamic from 'next/dynamic';

const ScenarioHome = dynamic(() => import('@/modules/team/Scenario/Home'), { ssr: false });

/**
 * 业务场景首页
 * @returns
 */
export default function Scenario() {
  return <ScenarioHome />;
}

Scenario.getLayout = getTeamLayout;
