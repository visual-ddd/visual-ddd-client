/**
 * 获取 Promise 的异常值，如果没有抛出异常，则返回 null
 * @param promise
 */
export function catchPromise<T>(promise: Promise<any>): Promise<T | null> {
  return new Promise<T | null>(resolve => {
    promise
      .then(() => {
        resolve(null);
      })
      .catch(err => {
        resolve(err);
      });
  });
}
