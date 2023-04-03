import { useLogout, useSession, VDSessionEntry, VDSessionState } from '@/modules/session';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react';
import { Avatar, Dropdown, MenuProps } from 'antd';
import { useMemo } from 'react';
import classNames from 'classnames';
import { AccountSetting, useAccountSetting } from '@/modules/user/AccountSetting';
import type { MenuItemType, ItemType } from 'antd/es/menu/hooks/useItems';

import { LayoutAction } from './types';
import s from './User.module.scss';

export interface UserProps {
  actions: LayoutAction[];
}

function stringifySessionState(state: VDSessionState) {
  switch (state.entry) {
    case VDSessionEntry.System:
      return '系统管理';
    case VDSessionEntry.Team:
      return `团队-${state.entryName}`;
    case VDSessionEntry.Organization:
      return `组织-${state.entryName}`;
  }
}

export const User = observer(function User(props: UserProps) {
  const { actions } = props;
  const router = useRouter();
  const { session } = useSession();
  const accountSetting = useAccountSetting();
  const logout = useLogout();

  const menus = useMemo<MenuProps>(() => {
    const items: ItemType[] = actions.map(i => {
      return 'type' in i && i.type === 'divider'
        ? i
        : ({
            key: i.name,
            label: i.name,
            onClick: i.handler,
          } as MenuItemType);
    });

    if (session?.user) {
      items.unshift(
        {
          key: 'user',
          disabled: true,
          label: (
            <div className={classNames('vd-user__name', s.profile)}>
              <div className="u-bold">{session.user.userName}</div>
              <div className="u-fs-5">{session.user.accountNo}</div>
              <div className={classNames('vd-user__version', s.version)}>系统版本: {process.env.VERSION}</div>
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
        label: (
          <span>
            切换空间
            {session?.state ? <span className="u-gray-500">(当前：{stringifySessionState(session.state)})</span> : ''}
          </span>
        ),
        onClick: async () => {
          router.push('/launch');
        },
      },
      {
        key: 'user-setting',
        label: '账号设置',
        onClick: () => {
          accountSetting.current?.open();
        },
      },
      { type: 'divider' },
      {
        key: 'logout',
        label: '退出登录',
        onClick: async () => {
          logout();
        },
      }
    );

    return { items: items };
  }, [actions, session?.user, accountSetting, router]);

  return (
    <>
      <AccountSetting ref={accountSetting} />
      <Dropdown menu={menus} placement="topRight" arrow trigger={['click']}>
        <Avatar
          src={session?.user.icon}
          alt={session?.user.userName}
          className={classNames('vd-user__avatar', s.avatar)}
          size={30}
          shape="square"
        >
          {session?.user.userName}
        </Avatar>
      </Dropdown>
    </>
  );
});

export default User;
