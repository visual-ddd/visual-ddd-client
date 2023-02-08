import router from 'next/router';

export const UNAUTH_CODE = 401;

export function isUnauth(code: number) {
  return code === UNAUTH_CODE;
}

export function gotoLogin() {
  const url = new URL('/login', globalThis.location.href);
  url.searchParams.append('from', router.route);

  router.push(url);
}
