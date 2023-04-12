const DEFAULT_ORIGIN = 'https://ddd.wakedt.cn';

export function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url, DEFAULT_ORIGIN);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch (err) {
    return null;
  }
}

export function toUrl(url: string) {
  try {
    return new URL(url, DEFAULT_ORIGIN);
  } catch {
    return null;
  }
}
