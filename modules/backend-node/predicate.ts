import { API_PREFIX } from './constants';

/**
 * 是否为后端服务路径
 * @param p
 * @returns
 */
export function isBackendPath(p: string) {
  return p.startsWith(API_PREFIX);
}
