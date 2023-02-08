import { getLayout } from '@/modules/layout';
import { useRouter } from 'next/router';

export default function App() {
  const router = useRouter();
  const { id } = router.query;
  return (
    <div>
      <div>我是团队app业务域内容,id:{id}</div>
    </div>
  );
}

App.getLayout = getLayout;
App.pageTitle = 'app业务域';
