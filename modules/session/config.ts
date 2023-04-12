import type { IronSessionOptions } from 'iron-session';
import { VDSessionEntry } from './types';

export const SESSION_COOKIE_NAME = 'vd-session';

export const IRON_SESSION_OPTIONS: IronSessionOptions = {
  password: process.env.SESSION_SECRET ?? 'DEVELOPMENT_ONLY_PLEASE_CHANGE_ME',
  cookieName: SESSION_COOKIE_NAME,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
};

export const RESTFUL_API_PREFIX = '/api/rest';

export const API_AUTH_WHITE_LIST = ['/login', '/logout', '/register'].map(i => `/api${i}`);

export const ENTRY_PREFIX = [
  // 三大模块
  `/${VDSessionEntry.System}`,
  `/${VDSessionEntry.Organization}`,
  `/${VDSessionEntry.Team}`,
];

/**
 * 启动页
 */
export const PAGE_LAUNCH = '/launch';

/**
 * 需要鉴权的页面
 */
export const PAGE_AUTH_BLACK_LIST = [
  // 启动页
  PAGE_LAUNCH,
  '/chat',
  ...ENTRY_PREFIX,
];

export const UNAUTH_CODE = 401;
export const NOT_FOUND_CODE = 404;

export const WAKEDATA_CODE_MAP: Record<string, number> = {
  [UNAUTH_CODE]: UNAUTH_CODE,
  [NOT_FOUND_CODE]: NOT_FOUND_CODE,
};
