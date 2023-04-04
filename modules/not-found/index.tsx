import { Button } from 'antd';
import s from './index.module.scss';
import { useSession } from '../session';
import Head from 'next/head';
import { useRouter } from 'next/router';

export const NotFound = () => {
  const router = useRouter();
  const session = useSession({
    immutable: true,
    shouldRedirect: false,
  });

  return (
    <div className={s.root}>
      <Head>
        <title>404 - 页面没了</title>
      </Head>
      <div className={s.logo}>🌚</div>
      <div className={s.code}>404</div>
      <div className={s.message}>页面就这么没了...</div>
      <div className={s.actions}>
        <Button onClick={() => router.push('/')}>返回首页</Button>
        {!!session.session && <Button onClick={() => router.push('/launch')}>切换空间</Button>}
      </div>
    </div>
  );
};
