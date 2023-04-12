import { Middleware } from '@/lib/middleware';
import { assert } from '@/lib/utils/assert';
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session/edge';

import {
  API_AUTH_WHITE_LIST,
  ENTRY_PREFIX,
  IRON_SESSION_OPTIONS,
  PAGE_AUTH_BLACK_LIST,
  RESTFUL_API_PREFIX,
  UNAUTH_CODE,
} from './config';
import { VDSessionCore } from './types';

export { SESSION_COOKIE_NAME } from './config';

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

const inEntryPrefix = (path: string) => {
  for (const i of ENTRY_PREFIX) {
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

  if (pathname.startsWith('/_') || !inPageAuthBlacklist(pathname)) {
    return next();
  }

  if (await checkAuthInMiddleware(req)) {
    return next();
  }

  const url = new URL('/login', req.url);
  url.searchParams.append('from', req.url);
  url.searchParams.append('flash', 'true');

  const redirect = NextResponse.redirect(url);

  return redirect;
};

/**
 * 页面入口权限验证和重定向
 * @param req
 * @param next
 * @returns
 */
export const pageEntryRedirectMiddleware: Middleware = async (req, next) => {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith('/_') || !inEntryPrefix(pathname)) {
    return next();
  }

  const session = await getSessionInMiddleware(req);

  assert(
    session,
    'pageEntryRedirectMiddleware: session is undefined, pageEntryRedirectMiddleware should be after pageAuthMiddleware'
  );

  const { state } = session;

  if (state == null) {
    // 导航到启动页
    return NextResponse.redirect(new URL('/launch', req.url));
  }

  // check entry
  const expectedEntry = `/${state.entry}${state.entryId ? '/' + state.entryId : ''}`;

  if (pathname.startsWith(expectedEntry)) {
    return next();
  }

  // 旧的入口可能已经销毁了？ -> 404 处理，CheckSession 客户端检查会话

  return NextResponse.redirect(new URL(expectedEntry, req.url));
};
