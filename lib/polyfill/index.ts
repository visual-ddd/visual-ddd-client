// 一些自定义 polyfill
// nextjs 内置的polyfill 见 https://github.com/vercel/next.js/tree/canary/packages/next-polyfill-nomodule/src
// 在 _app 顶部导入
import 'core-js/features/global-this';
import 'core-js/features/array/at';
