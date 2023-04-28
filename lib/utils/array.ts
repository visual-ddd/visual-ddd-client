import { NoopArray } from '@wakeapp/utils';

export function toArray<T>(maybeArray: T | T[] | undefined): T[] {
  return Array.isArray(maybeArray) ? maybeArray : maybeArray ? [maybeArray] : NoopArray;
}

/**
 * 从数组中随机取出一个元素
 */
export function randomPick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
