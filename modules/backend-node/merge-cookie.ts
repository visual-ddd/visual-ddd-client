import cookie from 'cookie';
import { serializeCookie } from './serialize-cookie';

export function mergeCookie(current: string | undefined | null, coming: Record<string, string>) {
  let set = current ? cookie.parse(current) : {};
  set = { ...set, ...coming };

  return serializeCookie(set);
}
