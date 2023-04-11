import type { AppProps } from 'next/app';
import { ConfigProvider } from 'antd';
import { configure } from 'mobx';
import { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { SWRConfig } from 'swr';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Script from 'next/script';
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';

import '../styles/theme.css';
import '../styles/globals.css';
import '../styles/override.css';
import '../styles/markdown.scss';

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

const Bot = dynamic(() => import('@/modules/chat-bot/ShowBotWhenLogged'), { ssr: false });
const VerifyPermission = dynamic(() => import('@/modules/user/Launch/VerifyPermission'), { ssr: false });

/**
 * 百度 统计
 * @returns
 */
const BaiduAnalyze = () => {
  if (!process.env.BD_ANALYZE_KEY) {
    return null;
  }

  return (
    <Script
      strategy="afterInteractive"
      id="baidu-analyze"
      dangerouslySetInnerHTML={{
        __html: `
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?${process.env.BD_ANALYZE_KEY}";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
  `,
      }}
    ></Script>
  );
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || (page => page);
  const { pageTitle } = Component;

  return (
    <SWRConfig>
      <ConfigProvider componentSize="small" locale={zhCN}>
        <Head>
          <title>Visual DDD</title>
        </Head>
        <BaiduAnalyze />
        <Bot />
        <VerifyPermission />
        {getLayout(<Component {...pageProps} />, pageTitle)}
      </ConfigProvider>
    </SWRConfig>
  );
}
