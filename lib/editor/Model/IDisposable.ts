import { isObject } from '@wakeapp/utils';

export interface IDisposable {
  /**
   * 析构器
   * @returns
   */
  dispose?: () => void;
}

/**
 * 尝试释放
 * @param maybeDisposable
 */
export function tryDispose(maybeDisposable: any) {
  if (isObject(maybeDisposable) && 'dispose' in maybeDisposable && typeof maybeDisposable.dispose === 'function') {
    maybeDisposable.dispose();
  }
}
