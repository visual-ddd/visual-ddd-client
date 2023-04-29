/**
 * 独立页面
 */
import './extensions';

import { Avatar, Dropdown } from 'antd';
import { ChatPage } from '@/lib/chat-bot';
import { useLogout, useSession } from '@/modules/session';
import { AccountSetting, useAccountSetting } from '@/modules/user/AccountSetting';
import { useRouter } from 'next/router';

import s from './StandalonePage.module.scss';

export function Chat() {
  const router = useRouter();
  const session = useSession();
  const logout = useLogout();
  const accountSetting = useAccountSetting();

  return (
    <ChatPage
      sidebarFooter={
        !!session.session && (
          <>
            <AccountSetting ref={accountSetting} />
            <Dropdown
              menu={{
                items: [
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
                ],
              }}
            >
              <Avatar className={s.user} src={session.session?.user.icon}></Avatar>
            </Dropdown>
          </>
        )
      }
    />
  );
}

export { Chat as default };
