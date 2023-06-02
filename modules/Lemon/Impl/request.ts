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

function request(path: string, method: RequestMethod, body: Record<string, any> = {}) {
  const url = new URL(path, BASE_URL);
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
  const urlSearch = new URLSearchParams(url);
  for (const [key, value] of Object.entries(query)) {
    urlSearch.set(key, value);
  }
  return urlSearch.toString();
}
export function get<T = any>(url: string, query?: Record<string, string>): Promise<T> {
  if (query) {
    return request(mergeQueryParams(url, query), 'GET');
  }
  return request(url, 'GET');
}

export function DELETE<T = any>(url: string, query?: Record<string, string>): Promise<T> {
  if (query) {
    return request(mergeQueryParams(url, query), 'DELETE');
  }
  return request(url, 'DELETE');
}

export function post<T = any, Body extends Record<string, any> = Record<string, any>>(
  url: string,
  body: Body
): Promise<T> {
  return request(url, 'POST', body);
}

export function patch<T = any, Body extends Record<string, any> = Record<string, any>>(
  url: string,
  body: Body
): Promise<T> {
  return request(url, 'PATCH', body);
}
