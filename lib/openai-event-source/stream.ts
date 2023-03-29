import { createParser } from 'eventsource-parser';
import { IDisposable } from '@/lib/utils';
import { extraRestErrorMessage } from '@/modules/backend-client';

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

  onMessage: (message: MessageEvent) => void;
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

      const parser = createParser(evt => {
        if (evt.type === 'event') {
          this.options.onMessage(evt as any);
        }
      });

      const reader = res.body.getReader();
      while (true) {
        const { done, value } = await reader.read();

        parser.feed(decoder.decode(value));

        if (done) {
          break;
        }
      }
    } finally {
      this.abortController = undefined;
    }
  }
}
