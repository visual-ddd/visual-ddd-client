import { createBackend, compose } from '@wakeapp/wakedata-backend';
import { gotoLogin, isUnauth } from './helper';

const request = createBackend();

request.initial({
  baseURL: '/',
  fetch: fetch.bind(globalThis),
  interceptor: compose(
    (request, next) => {
      // 后端接口多语言
      request.headers['Accept-Language'] = 'zh-cn';
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
