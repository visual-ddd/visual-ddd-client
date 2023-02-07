import * as request from '@wakeapp/wakedata-backend';
import { BACKEND } from './constants';

request.initial({
  baseURL: BACKEND.origin,
  fetch: fetch.bind(globalThis),
});

export function getRequestURL(path: string) {
  const url = new URL(path, BACKEND);

  return url;
}

export function parseResponse(json: any) {
  const res = request.normalizeResponse(json);
  return request.parseResponse(res);
}

export { request };
