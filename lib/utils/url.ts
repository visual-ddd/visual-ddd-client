export function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url, 'http://example.com');
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch (err) {
    return null;
  }
}
