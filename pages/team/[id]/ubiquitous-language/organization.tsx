import { getTeamLayout } from '@/modules/team/TeamLayout';
import dynamic from 'next/dynamic';

const OrganizationLanguage = dynamic(() => import('@/modules/team/UbiquitousLanguage/OrganizationLanguage'), {
  ssr: false,
});

/**
 * 组织统一语言
 * @returns
 */
export default function UbiquitousLanguage() {
  return <OrganizationLanguage />;
}

UbiquitousLanguage.getLayout = getTeamLayout;
