import Image from 'next/image';
import { useRouter } from 'next/router';

import s from './index.module.scss';
import cover from './pic.png';

export const Home = () => {
  const router = useRouter();

  return (
    <div className={s.root}>
      <div className={s.body}>
        <div className={s.logo}>
          <img src="/logo.svg" alt="logo" />
          <span>Visual DDD</span>
        </div>
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
