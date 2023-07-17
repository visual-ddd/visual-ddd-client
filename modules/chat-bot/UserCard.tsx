import { Avatar, Dropdown } from 'antd';
import { observer } from 'mobx-react';
import { useRouter } from 'next/router';

import { useLogout, useSession } from '../session';
import { AccountSetting, useAccountSetting } from '../user/AccountSetting';
import s from './UserCard.module.scss';

/**
 * 用户卡片
 */
export interface UserCardProps {}

/**
 * 用户卡片
 */
export const UserCard = observer(function UserCard(props: UserCardProps) {
  const router = useRouter();
  const session = useSession();
  const logout = useLogout();
  const accountSetting = useAccountSetting();

  return (
    <div className={s.root}>
      <Dropdown
        menu={{
          items: session.session
            ? [
                {
                  key: 'home',
                  label: '前往首页',
                  onClick: () => {
                    router.push('/');
                  },
                },
                {
                  key: 'user',
                  label: '账号信息',
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
                },
              ]
            : [
                {
                  key: 'logout',
                  label: '登录',
                  onClick: async () => {
                    router.push('/login');
                  },
                },
              ],
        }}
      >
        <footer className={s.footer}>
          <Avatar shape="square" className={s.avatar} src={session.session?.user.icon ?? '/logo.svg'}></Avatar>
          <div className={s.user}>
            <div className={s.name}>{session.session?.user.userName ?? '未登录'}</div>
            <div className={s.subName}>{session.session?.user.accountNo ?? '登录开启体验'}</div>
          </div>
        </footer>
      </Dropdown>
      <AccountSetting ref={accountSetting} />
    </div>
  );
});
