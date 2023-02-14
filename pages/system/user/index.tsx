import dynamic from 'next/dynamic';
import { getSystemLayout } from '@/modules/system/SystemLayout';

const User = dynamic(() => import('@/modules/system/User'), { ssr: false });

export default function UserPage() {
  return <User />;
}

UserPage.getLayout = getSystemLayout;
