import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiHandler } from 'next';
import { createFailResponse, isResponseError, request } from '@/modules/backend-node';

import { IRON_SESSION_OPTIONS, RESTFUL_API_PREFIX, WAKEDATA_CODE_MAP } from './config';

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
export function withWakedataRequestApiRoute(handler: NextApiHandler): NextApiHandler {
  return withSessionApiRoute(async (req, res) => {
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

    try {
      // handler 内部调用 request 可能会报错，这里拦截处理
      return await handler(req, res);
    } catch (err) {
      if (isResponseError(err)) {
        const code = err.code;
        const isRest = req.url?.startsWith(RESTFUL_API_PREFIX);

        if (isRest) {
          const status = code in WAKEDATA_CODE_MAP ? WAKEDATA_CODE_MAP[code] : 500;
          res.status(status);
        }
        res.json(createFailResponse(code, err.message));
      } else {
        throw err;
      }
    }
  });
}
