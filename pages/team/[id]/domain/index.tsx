import { getTeamLayout } from '@/modules/team/TeamLayout';
import dynamic from 'next/dynamic';

const DomainHome = dynamic(() => import('@/modules/team/Domain/Home'), { ssr: false });

/**
 * 业务域首页
 * @returns
 */
export default function Domain() {
  return <DomainHome />;
}

Domain.getLayout = getTeamLayout;
