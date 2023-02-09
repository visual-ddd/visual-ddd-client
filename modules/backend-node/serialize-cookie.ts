export function serializeCookie(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([key, value]) => {
      return `${key}=${value}`;
    })
    .join('; ');
}
