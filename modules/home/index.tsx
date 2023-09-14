import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

import s from './index.module.scss';
import cover from './pic.png';
import { useChatSupported } from '../chat-bot/hooks';

export const Header = () => {
  const aiSupported = useChatSupported();
  return (
    <header className={s.header}>
      <div className={s.logo}>
        <img src="/logo.svg" alt="logo" />
        <span>Visual DDD</span>
      </div>
      <div className={s.menus}>
        {aiSupported && (
          <Link href="/chat" className={s.menu}>
            Chat
          </Link>
        )}
        {/* <Link href="/price" className={s.menu}>
          订阅
        </Link> */}
        <Link href="/dashboard" className={s.menu}>
          登录
        </Link>
      </div>
    </header>
  );
};

export const Home = () => {
  const router = useRouter();

  return (
    <div className={s.root}>
      <Header></Header>
      <div className={s.body}>
        <main className={s.main}>
          <h1>可视化的 DDD 开发平台</h1>
          <h2>AI + 可视化 + DDD + 代码生成， 赋能企业业务开发</h2>
          <button onClick={() => router.push('/dashboard')}>开始使用</button>
        </main>
      </div>
      <div className={s.cover}>
        <Image src={cover} alt="cover" />
      </div>
    </div>
  );
};
