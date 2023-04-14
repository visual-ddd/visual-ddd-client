// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const { withSentryConfig } = require('@sentry/nextjs');

const pkg = require('./package.json');

const now = new Date();
const snapshot = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`;

const ENABLE_SENTRY_CLI =
  process.env.NODE_ENV === 'production' &&
  process.env.SENTRY_AUTH_TOKEN &&
  process.env.SENTRY_ORG &&
  process.env.SENTRY_PROJECT;

const VERSION = `${pkg.version}-${snapshot}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 暂时关闭，打开 react 会模拟 useEffect 多次执行
  swcMinify: true,
  output: 'standalone',
  // TODO: 移除
  productionBrowserSourceMaps: process.env.PRODUCTION_SOURCE_MAP === 'true',
  typescript: {
    // 不需要执行，以为我们在提交时进行验证
    ignoreBuildErrors: true,
  },
  env: {
    VERSION,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // https://nextjs.org/docs/api-reference/next.config.js/redirects
  // redirects: async () => {
  //   return [];
  // },
  transpilePackages: [
    '@wakeapp/inversify',
    '@wakeapp/framework-core',
    '@wakeapp/wakedata-backend',
    '@wakeapp/utils',
    '@wakeapp/hooks',
    '@ant-design/pro-components',
    'lodash-es',
    // lru-cache 包含了一些没有转换的特性
    'lru-cache',
    // https://github.com/ant-design/pro-components/issues/4852
    'antd',
    '@ant-design/plots',
    '@ant-design/icons',
    '@ant-design/icons-svg',
    '@ant-design/pro-components',
    '@ant-design/pro-layout',
    '@ant-design/pro-list',
    '@ant-design/pro-descriptions',
    '@ant-design/pro-form',
    '@ant-design/pro-skeleton',
    '@ant-design/pro-field',
    '@ant-design/pro-utils',
    '@ant-design/pro-provider',
    '@ant-design/pro-card',
    '@ant-design/pro-table',
    'rc-pagination',
    'rc-picker',
    'rc-util',
    'rc-tree',
    'rc-tooltip',
    'camelcase',
  ],
  experimental: {},
  webpack(config, { isServer, dev }) {
    // 支持 WebAssembly
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
  sentry: {
    hideSourcemaps: true,
    // 禁止 sentry source map 上传
    disableServerWebpackPlugin: !ENABLE_SENTRY_CLI,
    disableClientWebpackPlugin: !ENABLE_SENTRY_CLI,
  },
};

module.exports = withSentryConfig(nextConfig, {
  release: VERSION,
  errorHandler: err => {
    console.error('sentry error', err);
  },
});
