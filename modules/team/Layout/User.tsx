import { useSession } from '@/modules/session';
import { observer } from 'mobx-react';
import { Avatar, Dropdown, MenuProps } from 'antd';
import { useMemo } from 'react';
import classNames from 'classnames';
import { request } from '@/modules/backend-client';
import type { MenuItemType, ItemType } from 'antd/es/menu/hooks/useItems';

import { LayoutAction } from './types';
import s from './User.module.scss';
import { useRouter } from 'next/router';

export interface UserProps {
  actions: LayoutAction[];
}

export const User = observer(function User(props: UserProps) {
  const { actions } = props;
  const router = useRouter();
  const { session } = useSession();

  const menus = useMemo<MenuProps>(() => {
    const items: ItemType[] = actions.map(i => {
      return {
        key: i.name,
        label: i.name,
        onClick: i.handler,
      } as MenuItemType;
    });

    if (session?.user) {
      items.unshift(
        {
          key: 'user',
          disabled: true,
          label: (
            <div className={classNames('vd-user__name', s.name)}>
              <div className="u-bold">{session.user.userName}</div>
              <div className="u-fs-5">{session.user.accountNo}</div>
            </div>
          ),
        },
        {
          type: 'divider',
        }
      );
    }

    // 内置
    items.push(
      {
        key: 'launch',
        label: '前往启动页',
        onClick: async () => {
          router.push('/launch');
        },
      },
      {
        key: 'logout',
        label: '退出登录',
        onClick: async () => {
          await request.requestByPost('/api/logout');
          router.push('/login');
        },
      }
    );

    return { items: items };
  }, [actions, session?.user]);

  return (
    <Dropdown menu={menus} placement="topRight" arrow>
      <Avatar src={session?.user.icon} alt={session?.user.userName} className={classNames('vd-user__avatar', s.avatar)}>
        {session?.user.userName}
      </Avatar>
    </Dropdown>
  );
});

export default User;
