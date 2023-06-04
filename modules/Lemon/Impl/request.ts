import { assert } from '@/lib/utils';

const KEY = process.env.LEMON_API_KEY;

const BASE_URL = 'https://api.lemonsqueezy.com/';

type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

function createHeader(): Headers {
  assert(KEY, '缺少API KEY');
  const headers = new Headers();
  headers.set('Accept', 'application/vnd.api+json');
  headers.set('Content-Type', 'application/vnd.api+json');
  headers.set('Authorization', `Bearer ${KEY}`);

  return headers;
}

function methodsHasBody(method: RequestMethod) {
  return method !== 'GET' && method !== 'DELETE';
}

function request(uri: string, method: RequestMethod, body: Record<string, any> = {}) {
  const url = new URL(uri, BASE_URL);
  const headers = createHeader();
  const finallyBody = methodsHasBody(method) ? JSON.stringify(body) : undefined;
  return fetch(url, {
    method,
    headers: headers,
    body: finallyBody,
  }).then(res => {
    if (res.ok) {
      return res.json().then(json => {
        if (json.errors && json.errors.length > 0) {
          throw json;
        }
        return json;
      });
    }
    return res.json().then(errObj => {
      throw {
        status: res.status,
        message: res.statusText,
        errors: errObj.errors,
      };
    });
  });
}

function mergeQueryParams(url: string, query: Record<string, string>): string {
  const [path, search] = url.split('?');
  const urlSearch = new URLSearchParams(search);
  for (const [key, value] of Object.entries(query)) {
    urlSearch.set(key, value);
  }
  return `${path}?${decodeURIComponent(urlSearch.toString())}`;
}
export function get<T = any>(uri: string, query?: Record<string, string>): Promise<T> {
  if (query) {
    return request(mergeQueryParams(uri, query), 'GET');
  }
  return request(uri, 'GET');
}

export function DELETE<T = any>(uri: string, query?: Record<string, string>): Promise<T> {
  if (query) {
    return request(mergeQueryParams(uri, query), 'DELETE');
  }
  return request(uri, 'DELETE');
}

export function post<T = any, Body extends Record<string, any> = Record<string, any>>(
  uri: string,
  body: Body
): Promise<T> {
  return request(uri, 'POST', body);
}

export function patch<T = any, Body extends Record<string, any> = Record<string, any>>(
  uri: string,
  body: Body
): Promise<T> {
  return request(uri, 'PATCH', body);
}
