import dynamic from 'next/dynamic';
import { getSystemLayout } from '@/modules/system/SystemLayout';

const Organization = dynamic(() => import('@/modules/system/Organization'), { ssr: false });

/**
 * 组织管理
 * @returns
 */
export default function OrganizationPage() {
  return <Organization />;
}

OrganizationPage.getLayout = getSystemLayout;
