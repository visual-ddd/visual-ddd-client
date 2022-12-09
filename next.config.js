/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 暂时关闭，打开 react 会模拟 useEffect 多次执行
  swcMinify: true,
  experimental: {
    transpilePackages: ['@wakeapp/inversify', '@wakeapp/framework-core'],
  },
};

module.exports = nextConfig;
