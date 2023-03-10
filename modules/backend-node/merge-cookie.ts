import cookie from 'cookie';
import { serializeCookie } from './serialize-cookie';

export function mergeCookie(current: string | undefined | null, coming: Record<string, string>, toDelete?: string[]) {
  let set = current ? cookie.parse(current) : {};
  set = { ...set, ...coming };

  if (toDelete?.length) {
    for (const i of toDelete) {
      delete set[i];
    }
  }

  return serializeCookie(set);
}
