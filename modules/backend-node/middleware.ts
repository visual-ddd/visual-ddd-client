import { NextResponse } from 'next/server';
import { Middleware } from '@/lib/middleware';
import { getSessionInMiddleware } from '@/modules/session/middleware';

import { API_PREFIX, BACKEND } from './constants';

/**
 * 接口代理
 *
 * **生产环境可以使用 nginx 或者 k8s ingress 代理转发**
 */
export const proxyMiddleware: Middleware = async (req, next) => {
  const url = req.nextUrl;

  /**
   * 后端接口代理
   */
  if (url.pathname.startsWith(API_PREFIX)) {
    const url = new URL(req.url);
    url.protocol = BACKEND.protocol;
    url.host = BACKEND.host;

    const proxyRequest = new Request(url, req);

    // cookie 注入
    const session = await getSessionInMiddleware(req);

    if (session) {
      let cookie = Object.keys(session.cookies)
        .map(key => `${key}=${session.cookies[key]}`)
        .join('; ');
      proxyRequest.headers.set('Cookie', cookie);
    }

    proxyRequest.headers.delete('content-length');

    const res = await fetch(proxyRequest);
    return res as NextResponse;
  }

  return next();
};
