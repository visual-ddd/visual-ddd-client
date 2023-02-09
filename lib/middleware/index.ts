import { NextRequest, NextResponse } from 'next/server';

export type Middleware = (req: NextRequest, next: () => Promise<NextResponse>) => Promise<NextResponse>;

export class MiddlewareRunner {
  private list: Middleware[] = [];

  register(middleware: Middleware) {
    this.list.push(middleware);
  }

  async run(req: NextRequest) {
    const clone = [...this.list];
    let current = 0;
    const waiting: [(res: NextResponse) => void, (error: Error) => void][] = [];
    const flushResponse = (res: NextResponse) => {
      for (const [resolve] of waiting) {
        resolve(res);
      }
    };
    const flushError = (error: Error) => {
      for (const [, reject] of waiting) {
        reject(error);
      }
    };

    const next = async () => {
      current++;

      // 执行完毕
      if (current >= clone.length) {
        const res = NextResponse.next();

        flushResponse(res);

        return res;
      }

      const promise = new Promise<NextResponse>((resolve, reject) => {
        waiting.push([resolve, reject]);
      });

      // 执行下一个步骤
      const call = async () => {
        let nextCalled = false;
        const nextWrapper = () => {
          nextCalled = true;
          return next();
        };

        try {
          const result = await clone[current](req, nextWrapper);
          if (nextCalled) {
            return;
          }

          // 提前返回
          flushResponse(result);
        } catch (e) {
          // 异常
          flushError(e as Error);
        }
      };

      call();

      return promise;
    };

    return clone[current](req, next);
  }
}
