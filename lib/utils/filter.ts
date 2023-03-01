export function ignoreFalse<T>(value: T | false): value is T {
  return Boolean(value);
}
