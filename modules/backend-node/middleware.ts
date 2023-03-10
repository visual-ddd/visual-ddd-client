import { NextResponse } from 'next/server';
import { Middleware } from '@/lib/middleware';
import { getSessionInMiddleware, SESSION_COOKIE_NAME } from '@/modules/session/middleware';

import { API_PREFIX, BACKEND } from './constants';
import { mergeCookie } from './merge-cookie';

/**
 * 接口代理
 *
 * **生产环境可以使用 nginx 或者 k8s ingress 代理转发**
 *
 * 不能使用 middleware 二次转发，比如 本地 middleware 请求远程 middleware, 远程 middleware 再 fetch
 * 这种情况， 远程 middleware 会直接跳过
 */
export const proxyMiddleware: Middleware = async (req, next) => {
  const url = req.nextUrl;

  /**
   * 后端接口代理
   */
  if (url.pathname.startsWith(API_PREFIX)) {
    const proxyUrl = new URL(req.url);
    proxyUrl.protocol = BACKEND.protocol;
    proxyUrl.host = BACKEND.host;
    proxyUrl.port = BACKEND.port;

    const proxyRequest = new Request(proxyUrl, req);

    // 修改 host
    proxyRequest.headers.set('host', proxyUrl.host);

    // cookie 注入
    const session = await getSessionInMiddleware(req);

    if (session) {
      const old = proxyRequest.headers.get('cookie');
      const cookie = mergeCookie(old, session.cookies, [SESSION_COOKIE_NAME]);
      proxyRequest.headers.set('Cookie', cookie);
    }

    proxyRequest.headers.delete('content-length');
    // 这里对于自签名的域名请求可能会报错，
    // 可以开启 NODE_TLS_REJECT_UNAUTHORIZED=0 环境变量
    const res = await fetch(proxyRequest);
    return res as NextResponse;
  }

  return next();
};
