import { NextRequest, NextResponse } from 'next/server';
import { MiddlewareRunner } from './index';

jest.mock('next/server', () => {
  return {
    NextResponse: {
      next: () => {
        return { headers: new Headers() };
      },
    },
  };
});

test('middleware', async () => {
  const runner = new MiddlewareRunner();
  runner.register(async (req, next) => {
    req.headers.set('middleware-1', '1');
    return next();
  });
  runner.register(async (req, next) => {
    req.headers.set('middleware-2', '2');
    const response = await next();
    response.headers.set('middleware-2', '2');

    return response;
  });

  const req = { headers: new Headers() } as NextRequest;
  const res = await runner.run(req);
  expect(Array.from(req.headers.entries())).toEqual([
    ['middleware-1', '1'],
    ['middleware-2', '2'],
  ]);
  expect(Array.from(res.headers.entries())).toEqual([['middleware-2', '2']]);
});

test('middleware 中途返回', async () => {
  const runner = new MiddlewareRunner();
  const customResponse = {};

  runner.register(async (req, next) => {
    req.headers.set('middleware-1', '1');
    return next();
  });

  runner.register(async req => {
    req.headers.set('middleware-2', '2');

    return customResponse as NextResponse;
  });

  runner.register(async (req, next) => {
    req.headers.set('middleware-3', '3');

    return next();
  });

  const req = { headers: new Headers() } as NextRequest;
  const res = await runner.run(req);
  expect(Array.from(req.headers.entries())).toEqual([
    ['middleware-1', '1'],
    ['middleware-2', '2'],
  ]);
  expect(res).toBe(customResponse);
});

test('middleware 中途异常', async () => {
  const runner = new MiddlewareRunner();

  runner.register(async (req, next) => {
    req.headers.set('middleware-1', '1');
    return next();
  });

  runner.register(async req => {
    req.headers.set('middleware-2', '2');

    throw new Error('middleware error');
  });

  runner.register(async (req, next) => {
    req.headers.set('middleware-3', '3');

    return next();
  });

  const req = { headers: new Headers() } as NextRequest;
  const res = runner.run(req);
  expect(res).rejects.toThrowError('middleware error');
});
