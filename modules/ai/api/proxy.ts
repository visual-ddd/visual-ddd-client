import { NextApiHandler } from 'next';
import path from 'node:path';
import { getOpenAIBaseUrl } from '../platform';
import { createFailResponse } from '@/modules/backend-node';
import http from 'node:http';
import https from 'node:https';
import omit from 'lodash/omit';

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * ChatGPT API 代理
 */
export const chatGptProxy: NextApiHandler = (req, res) => {
  const baseUrl = getOpenAIBaseUrl();

  if (!baseUrl) {
    res.status(500).json(createFailResponse(500, 'OpenAI basePath 未配置'));
    return;
  }

  const { slug, ...other } = req.query as { slug: string[]; [key: string]: any };
  const url = new URL(baseUrl);

  const pathname = path.posix.join(url.pathname, slug.join('/')) ?? '';
  url.pathname = pathname;

  Object.keys(other).forEach(key => {
    url.searchParams.set(key, other[key]);
  });

  const agent = url.protocol === 'https:' ? https : http;

  const request = agent.request(
    url,
    {
      rejectUnauthorized: false,
      // Content-Length 不能写入，否则会挂起？
      headers: omit(req.headers, ['content-length', 'cookie']),
      method: req.method,
    },
    response => {
      for (const key in response.headers) {
        const val = response.headers[key];
        if (val != null) {
          res.setHeader(key, val);
        }
      }

      res.status(response.statusCode!);

      response.pipe(res);

      response.on('data', () => {
        // 强制刷新
        // 这个方法实际上不属于 ServerResponse, 而是 compression 库的，
        // 执行这个方法是为了快速将结果响应到客户端
        // @ts-expect-error
        res.flush();
      });
    }
  );

  request.on('error', error => {
    res.status(500).json(createFailResponse(500, error.message));
  });

  if (req.body != null) {
    if (typeof req.body === 'object') {
      request.write(JSON.stringify(req.body));
    } else {
      request.write(req.body);
    }
  }

  request.end();
};
