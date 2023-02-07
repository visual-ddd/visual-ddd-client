import { getLayout } from '@/modules/layout';
import { useRouter } from 'next/router';

export default function OrganizationList() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <div>我是组织管理列表,id:{id}</div>
    </div>
  );
}

OrganizationList.getLayout = getLayout;
OrganizationList.pageTitle = '组织管理';
