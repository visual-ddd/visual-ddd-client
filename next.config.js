const pkg = require('./package.json');

const now = new Date();
const snapshot = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 暂时关闭，打开 react 会模拟 useEffect 多次执行
  swcMinify: true,
  output: 'standalone',
  // TODO: 移除
  productionBrowserSourceMaps: true,
  typescript: {
    // 不需要执行，以为我们在提交时进行验证
    ignoreBuildErrors: true,
  },
  env: {
    VERSION: `${pkg.version}-${snapshot}`,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // https://nextjs.org/docs/api-reference/next.config.js/redirects
  redirects: async () => {
    return [
      {
        source: '/system',
        destination: '/system/user',

        // TODO: 临时解决方案，后续需要优化
        permanent: false,
      },
    ];
  },
  transpilePackages: [
    '@wakeapp/inversify',
    '@wakeapp/framework-core',
    '@wakeapp/wakedata-backend',
    '@wakeapp/utils',
    '@wakeapp/hooks',
    '@ant-design/pro-components',
    'lodash-es',
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
  ],
  experimental: {},
};

module.exports = nextConfig;
