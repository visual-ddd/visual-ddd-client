export function isAbort(err: any) {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return true;
  }
  return false;
}
