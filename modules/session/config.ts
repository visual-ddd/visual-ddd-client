import type { IronSessionOptions } from 'iron-session';
import { VDSessionEntry } from './types';

export const IRON_SESSION_OPTIONS: IronSessionOptions = {
  password: process.env.SESSION_SECRET ?? 'DEVELOPMENT_ONLY_PLEASE_CHANGE_ME',
  cookieName: 'vd-session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
};

export const RESTFUL_API_PREFIX = '/api/rest';

export const API_AUTH_WHITE_LIST = ['/login', '/logout', '/register'].map(i => `/api${i}`);

/**
 * 需要鉴权的页面
 */
export const PAGE_AUTH_BLACK_LIST = [
  // 启动页
  '/launch',

  // 三大模块
  `/${VDSessionEntry.System}`,
  `/${VDSessionEntry.Organization}`,
  `/${VDSessionEntry.Team}`,
];

export const UNAUTH_CODE = 401;

export const WAKEDATA_CODE_MAP: Record<string, number> = {
  [UNAUTH_CODE]: UNAUTH_CODE,
};
