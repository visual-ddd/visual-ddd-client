import { Middleware } from '@/lib/middleware';
import memoize from 'lodash/memoize';
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session/edge';

import {
  API_AUTH_WHITE_LIST,
  IRON_SESSION_OPTIONS,
  PAGE_AUTH_BLACK_LIST,
  RESTFUL_API_PREFIX,
  UNAUTH_CODE,
} from './config';
import { createFailResponse } from '../backend-node';

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
const inApiAuthWhitelist = memoize((path: string) => {
  path = path.startsWith('/api') ? path.slice(4) : path;
  for (const i of API_AUTH_WHITE_LIST) {
    if (path.startsWith(i)) {
      return true;
    }
  }

  return false;
});

/**
 * 需要进行鉴权的页面
 */
const inPageAuthBlacklist = memoize((path: string) => {
  for (const i of PAGE_AUTH_BLACK_LIST) {
    if (path.startsWith(i)) {
      return true;
    }
  }

  return false;
});

async function isAuth(req: NextRequest, res: NextResponse): Promise<boolean> {
  const session = await getIronSession(req, res, IRON_SESSION_OPTIONS);

  return !!session.content;
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

  const response = NextResponse.json(createFailResponse(UNAUTH_CODE, '请登录后重试'), {
    // RESTful 接口使用状态码来标记请求状态
    status: isRestfulAPI(pathname) ? 401 : 200,
  });

  if (await isAuth(req, response)) {
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

  if (await isAuth(req, redirect)) {
    return next();
  }

  return redirect;
};
