import { getTeamLayout } from '@/modules/team/TeamLayout';
import dynamic from 'next/dynamic';

const Home = dynamic(() => import('@/modules/team/App/Home'), { ssr: false });

/**
 * 应用首页
 * @returns
 */
export default function App() {
  return <Home />;
}

App.getLayout = getTeamLayout;
