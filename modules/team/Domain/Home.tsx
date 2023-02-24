import { useRequestByGet } from '@/modules/backend-client';
import { useLayoutTitle } from '@/modules/Layout';
import { Button, Empty } from 'antd';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { DomainDetail } from '../types';
import { CreateDomain, useCreateDomain } from './Create';

export const DomainHome = () => {
  const router = useRouter();
  const teamId = router.query.id as string | undefined;
  const createDomainRef = useCreateDomain();
  const { data } = useRequestByGet<DomainDetail[]>(
    teamId ? `/wd/visual/web/domain-design/domain-design-page-query?teamId=${teamId}&pageNo=1&pageSize=10000` : null
  );

  useLayoutTitle('创建业务域');

  return (
    <div className={classNames('vd-domain-home', 'u-abs-center')}>
      <CreateDomain teamId={teamId!} ref={createDomainRef} />
      <Empty
        description={
          <div>
            {data?.length ? '请选择左侧业务域, 或者' : '暂无业务域，你可以'}
            <Button size="small" type="primary" className="u-ml-xs" onClick={() => createDomainRef.current?.open()}>
              创建业务域
            </Button>
          </div>
        }
      ></Empty>
    </div>
  );
};

export default DomainHome;
