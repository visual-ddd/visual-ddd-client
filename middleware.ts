import { NextRequest } from 'next/server';
import { MiddlewareRunner } from './lib/middleware';

import { proxyMiddleware } from './modules/backend-node/middleware';
import { pageAuthMiddleware, apiAuthMiddleware } from './modules/session/middleware';

const runner = new MiddlewareRunner();
runner.register(proxyMiddleware);
runner.register(apiAuthMiddleware);
runner.register(pageAuthMiddleware);

/**
 * 所有请求都会经过中间件，包括静态资源，API 接口
 * @param req
 * @returns
 */
export async function middleware(req: NextRequest) {
  return runner.run(req);
}
