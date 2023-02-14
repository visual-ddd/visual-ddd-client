import type { AppProps } from 'next/app';
import { ConfigProvider } from 'antd';
import { configure } from 'mobx';
import { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';

import '../styles/theme.css';
import '../styles/globals.css';
import { SWRConfig } from 'swr';

configure({
  enforceActions: 'always',
});

dayjs.locale('zh-cn');

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement, pageTitle?: string) => ReactNode;
  pageTitle?: string;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || (page => page);
  const { pageTitle } = Component;

  return (
    <SWRConfig>
      <ConfigProvider componentSize="small" locale={zhCN}>
        {getLayout(<Component {...pageProps} />, pageTitle)}
      </ConfigProvider>
    </SWRConfig>
  );
}
