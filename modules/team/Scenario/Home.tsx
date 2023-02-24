import { useRequestByGet } from '@/modules/backend-client';
import { useLayoutTitle } from '@/modules/Layout';
import { Button, Empty } from 'antd';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { ScenarioSimple } from '../types';
import { CreateScenario, useCreateScenario } from './Create';

export const DomainHome = () => {
  const router = useRouter();
  const teamId = router.query.id as string | undefined;
  const createScenarioRef = useCreateScenario();
  const { data } = useRequestByGet<ScenarioSimple[]>(
    teamId ? `/wd/visual/web/business-scene/business-scene-page-query?teamId=${teamId}&pageNo=1&pageSize=10000` : null
  );

  useLayoutTitle('创建业务场景');

  return (
    <div className={classNames('vd-domain-home', 'u-abs-center')}>
      <CreateScenario teamId={teamId!} ref={createScenarioRef} />
      <Empty
        description={
          <div>
            {data?.length ? '请选择左侧业务场景, 或者' : '暂无业务场景，你可以'}
            <Button size="small" type="primary" className="u-ml-xs" onClick={() => createScenarioRef.current?.open()}>
              创建业务场景
            </Button>
          </div>
        }
      ></Empty>
    </div>
  );
};

export default DomainHome;
