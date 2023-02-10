import { getTeamLayout } from '@/modules/team/TeamLayout';
import { DomainDetail } from '@/modules/team/types';

/**
 * 应用首页
 * @returns
 */
export default function App(props: { detail: DomainDetail }) {
  return <div>app</div>;
}

App.getLayout = getTeamLayout;
