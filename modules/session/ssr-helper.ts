/**
 * 服务端渲染(getServerSideProps)时，相关辅助方法
 */
import { withIronSessionSsr } from 'iron-session/next';
import type { GetServerSideProps, PreviewData } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { isResponseError, request } from '@/modules/backend-node';

import { IRON_SESSION_OPTIONS, NOT_FOUND_CODE, UNAUTH_CODE } from './config';

/**
 * 注入 session 到 getServerSideProps 处理器
 * @param handler
 * @returns
 */
export const withSessionSsr = <
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
>(
  handler: GetServerSideProps<P, Q, D>
): GetServerSideProps<P, Q, D> => {
  // @ts-expect-error
  return withIronSessionSsr(handler, IRON_SESSION_OPTIONS);
};

/**
 * 注入 wakedata 请求方法
 * @param handler
 * @returns
 */
export function withWakedataRequestSsr<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
>(handler: GetServerSideProps<P, Q, D>): GetServerSideProps<P, Q, D> {
  return withSessionSsr<P, Q, D>(async context => {
    const { req } = context;
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
      return await handler(context);
    } catch (err) {
      // 捕获未授权
      if (isResponseError(err)) {
        const code = err.code;
        if (code === UNAUTH_CODE) {
          context.res.setHeader('Cache-Control', 'no-cache');
          return {
            redirect: { permanent: false, destination: `/login?from=${req.url}&flash=true&capturer=ssr` },
          };
        } else if (code === NOT_FOUND_CODE) {
          console.warn(`资源未找到: ${req.url}`);
          // 资源未找到
          return {
            notFound: true,
          };
        }
      }
      throw err;
    }
  });
}
