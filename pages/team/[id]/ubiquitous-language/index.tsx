import { getTeamLayout } from '@/modules/team/TeamLayout';
import dynamic from 'next/dynamic';

const TeamLanguage = dynamic(() => import('@/modules/team/UbiquitousLanguage/TeamLanguage'), { ssr: false });

/**
 * 团队首页
 * @returns
 */
export default function UbiquitousLanguage() {
  return <TeamLanguage />;
}

UbiquitousLanguage.getLayout = getTeamLayout;
