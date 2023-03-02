import router from 'next/router';

export const UNAUTH_CODE = 401;

export function isUnauth(code: number) {
  return code === UNAUTH_CODE;
}

export function gotoLogin() {
  console.debug('跳转到登录页面');
  const url = new URL('/login', globalThis.location.href);
  url.searchParams.append('from', router.asPath);
  url.searchParams.append('flash', 'true');

  router.push(url);
}
