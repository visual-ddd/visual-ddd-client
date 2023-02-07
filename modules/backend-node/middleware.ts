import { NextRequest, NextResponse } from 'next/server';
import { Middleware } from '@/lib/middleware';

import { API_PREFIX, BACKEND } from './constants';

/**
 * 接口代理
 */
export const proxyMiddleware: Middleware = async (req, next) => {
  const url = req.nextUrl;

  /**
   * 后端接口代理
   * TODO: cookie 注入
   */
  if (url.pathname.startsWith(API_PREFIX)) {
    const url = new URL(req.url);
    url.protocol = BACKEND.protocol;
    url.host = BACKEND.host;

    const proxyRequest = new NextRequest(url, req);

    const res = await fetch(proxyRequest);
    return res as NextResponse;
  }

  return next();
};
