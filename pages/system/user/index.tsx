import dynamic from 'next/dynamic';
import { getSystemLayout } from '@/modules/system/SystemLayout';

const User = dynamic(() => import('@/modules/system/User'), { ssr: false });

/**
 * 用户管理
 * @returns
 */
export default function UserPage() {
  return <User />;
}

UserPage.getLayout = getSystemLayout;
