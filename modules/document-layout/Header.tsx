import { Button } from 'antd';
import classNames from 'classnames';
import { useSession } from '@/modules/session';
import { useRouter } from 'next/router';

import s from './Header.module.scss';

export interface HeaderProps {
  /**
   * 悬浮模式
   */
  fixed?: boolean;
}

export const Header = (props: HeaderProps) => {
  const { fixed } = props;
  const session = useSession({ shouldRedirect: false });
  const router = useRouter();

  const gotoDashboard = () => {
    if (!session.session) {
      router.push('/login');
      return;
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <header className={classNames(s.root, { fixed })}>
      <div className={s.body}>
        <div className={s.logo}>
          <img src="/logo.svg" alt="logo" />
          <span>Visual DDD</span>
        </div>
        <div className={s.extra}>
          <Button type="primary" onClick={gotoDashboard}>
            {session.session ? '进入平台' : '登录'}
          </Button>
        </div>
      </div>
    </header>
  );
};
