import { IDisposable, isAbort } from '@/lib/utils';
import { extraRestErrorMessage } from '@/modules/backend-client';

export { isAbort };

export interface EventStreamOptions {
  url: string | URL;

  /**
   * 如果是 GET, 将放到 url 的 query 中，反之则以 JSON Body 的形式发送
   */
  body?: Record<string, any>;

  /**
   * 默认为 GET
   */
  method?: 'GET' | 'POST';

  /**
   * 接受消息
   * @param message
   * @returns
   */
  onMessage: (message: string) => void;

  /**
   * 结束
   * @returns
   */
  onDone: () => void;
}

/**
 * 消费 SSE
 * 为什么不直接使用 EventSource 类?
 * - 因为 EventSource 类不支持 AbortController
 * - 因为 EventSource 类不支持自定义 headers
 * - 因为 EventSource 类不支持自定义 method
 * - 因为 EventSource 类不支持自定义 body
 * - 因为 EventSource 类在查询参数中包含JSON可能无法正常工作
 */
export class EventStream implements IDisposable {
  private options: EventStreamOptions;
  private disposed = false;
  private abortController?: AbortController;

  constructor(options: EventStreamOptions) {
    this.options = options;
  }

  dispose() {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.abortController?.abort();
  }

  async send() {
    const decoder = new TextDecoder();
    const method = this.options.method || 'GET';
    const url =
      typeof this.options.url === 'string' ? new URL(this.options.url, window.location.href) : this.options.url;
    const headers = new Headers();
    let body: any;

    if (method === 'GET') {
      if (this.options.body) {
        for (const key in this.options.body) {
          url.searchParams.set(key, this.options.body[key]);
        }
      }
    } else {
      headers.set('Content-Type', 'application/json');
      if (this.options.body) {
        body = JSON.stringify(this.options.body);
      }
    }

    try {
      this.abortController = new AbortController();
      const res = await fetch(url, {
        headers,
        method,
        body,
        signal: this.abortController.signal,
      });

      if (this.disposed) {
        return;
      }

      if (!res.ok) {
        if (res.headers.get('Content-Type')?.startsWith('application/json')) {
          const message = await extraRestErrorMessage(res);
          if (message) {
            throw new Error(message);
          }
        }

        throw new Error(`Request Error: ${res.status} ${res.statusText}`);
      }

      if (res.body == null) {
        throw new Error('Response body is null');
      }

      await new Promise<void>(async (resolve, reject) => {
        let stop = false;
        const fail = (reason: any) => {
          if (stop) return;
          stop = true;
          reject(reason);
        };

        try {
          const reader = res.body!.getReader();
          while (!stop) {
            const { done, value } = await reader.read();

            const data = decoder.decode(value);

            this.options.onMessage(data);

            if (done) {
              this.options.onDone();
              break;
            }
          }

          resolve();
        } catch (err) {
          fail(err);
        }
      });
    } catch (err) {
      // 取消操作, 让上层来处理
      // if (isAbort(err)) {
      //   return;
      // }

      throw err;
    } finally {
      this.abortController = undefined;
    }
  }
}
