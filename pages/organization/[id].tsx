import { getOrganizationLayout } from '@/modules/organization/OrganizationLayout';
import dynamic from 'next/dynamic';

const Organization = dynamic(() => import('@/modules/organization/Organization'), { ssr: false });

/**
 * 组织管理
 * @returns
 */
export default function OrganizationPage() {
  return <Organization />;
}

OrganizationPage.getLayout = getOrganizationLayout;
