import * as request from '@wakeapp/wakedata-backend';
import { Response } from '@wakeapp/wakedata-backend';
import { BACKEND } from './constants';
import { serializeCookie } from './serialize-cookie';
import type { VDSessionCore } from '@/modules/session';

declare global {
  interface WakedataRequestMeta {
    /**
     * 注入的会话信息
     */
    session?: VDSessionCore;
  }
}

request.initial({
  baseURL: BACKEND.origin,
  fetch: fetch.bind(globalThis),
  interceptor: request.compose(
    (request, next) => {
      request.headers['Accept-Language'] = 'zh-cn';
      return next();
    },
    (request, next) => {
      if (request.meta.session) {
        // 注入会话信息
        const cookie = serializeCookie(request.meta.session.cookies);
        request.headers['Cookie'] = cookie;
      }

      return next();
    }
  ),
});

export type WakedataResponse<T> = Omit<Response<T>, '__raw__'>;

export function getRequestURL(path: string) {
  const url = new URL(path, BACKEND);

  return url;
}

export function parseResponse(json: any) {
  const res = request.normalizeResponse(json);
  return request.parseResponse(res);
}

export function createSuccessResponse<T>(data: T): WakedataResponse<T> {
  return { data, success: true, errorCode: 100, errorMessage: '' };
}

/**
 * 创建失败响应
 * @param code
 * @param message
 */
export function createFailResponse(code: number, message: string): WakedataResponse<void>;
export function createFailResponse<T = undefined>(code: number, message: string, data: T): WakedataResponse<T>;
export function createFailResponse(code: number, message: string, data?: unknown): WakedataResponse<unknown> {
  return { data: data, success: false, errorCode: code, errorMessage: message };
}

export { request };
