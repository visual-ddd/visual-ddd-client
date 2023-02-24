import { useRequestByGet } from '@/modules/backend-client';
import { Button, Empty } from 'antd';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { addTrailingSlash } from '@wakeapp/utils';
import { useEffect } from 'react';
import { useLayoutTitle } from '@/modules/Layout';

import { DomainDetail } from '../types';
import { CreateApp, useCreateApp } from './Create';

export const AppHome = () => {
  const router = useRouter();
  const teamId = router.query.id as string | undefined;
  const createRef = useCreateApp();
  const { data } = useRequestByGet<DomainDetail[]>(
    teamId ? `/wd/visual/web/application/application-page-query?teamId=${teamId}&pageNo=1&pageSize=10000` : null
  );

  useLayoutTitle('创建应用');

  useEffect(() => {
    if (data?.length) {
      router.push(addTrailingSlash(router.asPath) + data[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, router.asPath]);

  return (
    <div className={classNames('vd-domain-home', 'u-abs-center')}>
      <CreateApp teamId={teamId!} ref={createRef} />
      <Empty
        description={
          <div>
            {data?.length ? '请选择左侧应用, 或者' : '暂无应用，你可以'}
            <Button size="small" type="primary" className="u-ml-xs" onClick={() => createRef.current?.open()}>
              创建应用
            </Button>
          </div>
        }
      ></Empty>
    </div>
  );
};

export default AppHome;
