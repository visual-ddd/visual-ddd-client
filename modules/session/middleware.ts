import { Middleware } from '@/lib/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session/edge';

import {
  API_AUTH_WHITE_LIST,
  IRON_SESSION_OPTIONS,
  PAGE_AUTH_BLACK_LIST,
  RESTFUL_API_PREFIX,
  UNAUTH_CODE,
} from './config';
import { VDSessionCore } from './types';

/**
 * Restful API
 * @param path
 * @returns
 */
const isRestfulAPI = (path: string) => {
  return path.startsWith(RESTFUL_API_PREFIX);
};

/**
 * 不需要进行鉴权的 API
 */
const inApiAuthWhitelist = (path: string) => {
  for (const i of API_AUTH_WHITE_LIST) {
    if (path.startsWith(i)) {
      return true;
    }
  }

  return false;
};

/**
 * 需要进行鉴权的页面
 */
const inPageAuthBlacklist = (path: string) => {
  for (const i of PAGE_AUTH_BLACK_LIST) {
    if (path.startsWith(i)) {
      return true;
    }
  }

  return false;
};

export async function getSessionInMiddleware(req: NextRequest): Promise<VDSessionCore | undefined> {
  // response 不是必须的，入口你不打算修改 session 的话
  const session = await getIronSession(req, {} as any, IRON_SESSION_OPTIONS);

  return session.content;
}

export async function checkAuthInMiddleware(req: NextRequest): Promise<boolean> {
  return !!(await getSessionInMiddleware(req));
}

/**
 * 认证检查中间件
 */
export const apiAuthMiddleware: Middleware = async (req, next) => {
  const pathname = req.nextUrl.pathname;

  if (!pathname.startsWith('/api')) {
    return next();
  }

  if (inApiAuthWhitelist(pathname)) {
    return next();
  }

  const response = NextResponse.json(
    { data: null, success: false, errorCode: UNAUTH_CODE, errorMessage: '请登录后重试' },
    {
      // RESTful 接口使用状态码来标记请求状态
      status: isRestfulAPI(pathname) ? 401 : 200,
    }
  );

  if (await checkAuthInMiddleware(req)) {
    return next();
  }

  // 未授权
  return response;
};

/**
 * 页面认证检查
 * @param req
 * @param next
 * @returns
 */
export const pageAuthMiddleware: Middleware = async (req, next) => {
  const pathname = req.nextUrl.pathname;

  if (!inPageAuthBlacklist(pathname)) {
    return next();
  }

  const url = new URL('/login', req.url);
  url.searchParams.append('from', req.url);

  const redirect = NextResponse.redirect(url);

  if (await checkAuthInMiddleware(req)) {
    return next();
  }

  return redirect;
};
