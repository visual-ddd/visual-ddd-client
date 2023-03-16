import { NextRequest } from 'next/server';
import { MiddlewareRunner } from './lib/middleware';

import { proxyMiddleware } from './modules/backend-node/middleware';
import { pageAuthMiddleware, apiAuthMiddleware, pageEntryRedirectMiddleware } from './modules/session/middleware';

const runner = new MiddlewareRunner();
runner.register(proxyMiddleware);
runner.register(apiAuthMiddleware);
runner.register(pageAuthMiddleware);
runner.register(pageEntryRedirectMiddleware);

/**
 * 所有请求都会经过中间件，包括静态资源，API 接口
 * Next.js 限制 middleware 只能在 edge runtime 运行，会有比较多限制
 * @param req
 * @returns
 */
export async function middleware(req: NextRequest) {
  return runner.run(req);
}
