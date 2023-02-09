import cookie from 'cookie';

export function parseSetCookie(str: string): Record<string, string> {
  return cookie.parse(
    str
      .split(',')
      .map(i => {
        return i.split(';')[0].trim();
      })
      .join(';')
  );
}
