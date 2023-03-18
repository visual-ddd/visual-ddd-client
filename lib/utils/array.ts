import { NoopArray } from '@wakeapp/utils';

export function toArray<T>(maybeArray: T | T[] | undefined): T[] {
  return Array.isArray(maybeArray) ? maybeArray : maybeArray ? [maybeArray] : NoopArray;
}
