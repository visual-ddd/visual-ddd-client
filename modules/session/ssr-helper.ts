/**
 * 服务端渲染(getServerSideProps)时，相关辅助方法
 */
import { withIronSessionSsr } from 'iron-session/next';
import type { GetServerSideProps, PreviewData } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { request } from '@/modules/backend-node';

import { IRON_SESSION_OPTIONS } from './config';

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
  return withSessionSsr<P, Q, D>(context => {
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

    return handler(context);
  });
}
