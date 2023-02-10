import { PlusOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps } from 'antd';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { CreateDomain, useCreateDomain } from '../Domain/Create';
import { CreateApp, useCreateApp } from '../App/Create';

import s from './index.module.scss';

export const TeamCreator = () => {
  const router = useRouter();
  const teamId = router.query.id as string | undefined;
  const createDomainRef = useCreateDomain();
  const createAppRef = useCreateApp();

  const menus = useMemo<MenuProps>(() => {
    return {
      items: [
        {
          key: 'domain',
          label: '创建业务域',
          onClick: () => {
            createDomainRef.current?.open();
          },
        },
        {
          key: 'scenario',
          label: '创建业务场景',
          onClick: () => {},
        },
        {
          key: 'app',
          label: '创建应用',
          onClick: () => {
            createAppRef.current?.open();
          },
        },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classNames('vd-team-creator', s.root)}>
      <Dropdown menu={menus} placement="bottomRight" arrow>
        <PlusOutlined />
      </Dropdown>
      <CreateDomain ref={createDomainRef} teamId={teamId!} />
      <CreateApp ref={createAppRef} teamId={teamId!} />
    </div>
  );
};

export default TeamCreator;
