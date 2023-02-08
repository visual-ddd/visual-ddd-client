import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiHandler } from 'next';
import { request } from '@/modules/backend-node';

import { IRON_SESSION_OPTIONS } from './config';

/**
 * 注入 session 到 api 处理器
 * @param handler
 * @returns
 */
export const withSessionApiRoute = (handler: NextApiHandler): NextApiHandler => {
  return withIronSessionApiRoute(handler, IRON_SESSION_OPTIONS);
};

type Request = typeof request.request;

declare module 'http' {
  // 注入请求方法
  interface IncomingMessage {
    request: Request;
  }
}

/**
 * 注入 wakedata 请求方法
 * @param handler
 * @returns
 */
export function withWakedataRequest(handler: NextApiHandler): NextApiHandler {
  return withSessionApiRoute((req, res) => {
    const session = req.session.content;
    req.request = (url, body, config) => {
      return request.request(url, body, {
        ...config,
        meta: {
          ...config?.meta,
          session,
        },
      });
    };

    return handler(req, res);
  });
}
