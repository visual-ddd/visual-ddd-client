import { parseResponse } from '@wakeapp/wakedata-backend';
import { request, normalizeResponse } from './request';

/**
 * 文件下载
 */
export async function download(params: {
  name: string;
  /**
   * 请求方法, 默认 GET
   */
  method?: 'GET' | 'POST';

  /**
   * 请求载荷
   */
  body?: any;

  /**
   * 文件名称
   */
  filename: string;
}) {
  const { name, method, body, filename } = params;

  const result = await request.request<Blob>(name, body, {
    method: method ?? 'GET',
    meta: {
      responseType: 'blob',
    },
  });

  if (result.type === 'application/json') {
    // 可能错误了
    const jsonResult = normalizeResponse(JSON.parse(await result.text()));

    // 返回响应的结果
    return parseResponse(jsonResult);
  } else {
    const anchor = document.createElement('a');
    anchor.setAttribute('download', filename);
    const href = URL.createObjectURL(result);
    anchor.href = href;
    anchor.setAttribute('target', '_blank');
    anchor.click();

    return result;
  }
}
