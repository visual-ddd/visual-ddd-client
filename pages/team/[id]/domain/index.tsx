import { getLayout } from '@/modules/layout';
import { useRouter } from 'next/router';

export default function Domain() {
  const router = useRouter();
  const { id } = router.query;
  return (
    <div>
      <div>我是domain业务域内容,id:{id}</div>
    </div>
  );
}

Domain.getLayout = getLayout;
Domain.pageTitle = 'domain业务域';
