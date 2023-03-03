export function ignoreFalse<T>(value: T | false): value is T {
  return Boolean(value);
}

export function elseUndefined(value: any): true | undefined {
  if (value) {
    return true;
  }
  return undefined;
}
