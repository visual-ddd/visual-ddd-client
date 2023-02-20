import { createBackend, compose, FuckResponse, Response } from '@wakeapp/wakedata-backend';
import { gotoLogin, isUnauth } from './helper';

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
    (request, next) => {
      // 后端接口多语言
      request.headers['Accept-Language'] = 'zh';
      return next();
    },
    async (request, next) => {
      // 会话失效处理
      const response = await next();
      if (!response.success && response.errorCode != null) {
        if (isUnauth(response.errorCode)) {
          // 会话失效, 跳转到登录页面
          gotoLogin();
        }
      }

      return response;
    }
  ),
});

export { request };