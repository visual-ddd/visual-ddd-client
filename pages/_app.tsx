import type { AppProps } from 'next/app';
import { ConfigProvider } from 'antd';
import { configure } from 'mobx';
import { useRouter } from 'next/router';
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';

import { useSyncEffect } from '@/lib/hooks';
import { createPageScope } from '@/lib/framework';

import '../styles/globals.css';

configure({
  enforceActions: 'always',
});

dayjs.locale('zh-cn');

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // 注册页面级别的依赖注入 scope
  // next 根据路由来渲染页面，路由变动时才会创建页面实例
  // 这里的路由变动不包括查询字符串、路由参数变动，这类情况的变动，页面还是同一个实例
  useSyncEffect(() => {
    console.log('inject page scope');
    return createPageScope();
  }, [router.route]);

  return (
    <ConfigProvider locale={zhCN}>
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
