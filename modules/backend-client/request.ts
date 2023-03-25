import { forever } from '@/lib/utils';
import { createBackend, compose, FuckResponse, Response } from '@wakeapp/wakedata-backend';
import { IGNORE_AUTH_ERROR } from './constants';
import { gotoLogin, isUnauth } from './helper';

declare global {
  interface WakedataRequestMeta {
    /**
     * 是否忽略鉴权错误, 如果为 true，将忽略服务端返回的 401 错误
     * 需要由客户端自己处理该异常
     */
    [IGNORE_AUTH_ERROR]?: boolean;
  }
}

/**
 * 规范化响应
 * @param response
 * @returns
 */
export function normalizeResponse<T>(response: FuckResponse<T>): Response<T> {
  const { data, success, errorCode, errorMessage, msg, code, ...other } = response;
  return {
    ...other,
    data,
    success,
    errorCode: errorCode ?? code,
    errorMessage: errorMessage ?? msg,
  };
}

const request = createBackend();

request.initial({
  baseURL: '/',
  fetch: fetch.bind(globalThis),
  interceptor: compose(
    (req, next) => {
      // 后端接口多语言
      req.headers['Accept-Language'] = 'zh';
      return next();
    },
    async (req, next) => {
      // 会话失效处理
      const response = await next();
      if (!response.success && response.errorCode != null) {
        if (isUnauth(response.errorCode) && !req.meta[IGNORE_AUTH_ERROR]) {
          // 会话失效, 跳转到登录页面
          gotoLogin();
          await forever();
        }
      }

      return response;
    }
  ),
});

export { request };
