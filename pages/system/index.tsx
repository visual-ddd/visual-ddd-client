import { getLayout } from '@/modules/layout';

export default function System() {
  return (
    <div>
      <div>我是系统管理</div>
    </div>
  );
}
System.getLayout = getLayout;
System.pageTitle = '系统管理';
