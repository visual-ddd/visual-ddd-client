import { parseResponse as parseResponse, isResponseError } from '@wakeapp/wakedata-backend';
import { gotoLogin, isUnauth } from './helper';

export async function parseRestError(response: Response): Promise<void> {
  if (response.ok) {
    throw new Error(`只能在 !response.ok 时调用该接口`);
  }

  const json = await response.json();
  parseResponse(json);
}

export { isResponseError };

/**
 * 提取 rest 接口的错误信息
 *
 * 这里也会对错误进行处理, 比如会话失效
 * @param response
 */
export async function extraRestErrorMessage(response: Response): Promise<string | undefined> {
  if (response.ok) {
    throw new Error(`只能在 !response.ok 时调用该接口`);
  }

  try {
    const json = await response.json();
    parseResponse(json);
  } catch (err) {
    console.error(err);
    // 副作用
    if (isResponseError(err)) {
      if (isUnauth(err.code)) {
        gotoLogin();
      }
    }

    return (err as Error).message;
  }
}
