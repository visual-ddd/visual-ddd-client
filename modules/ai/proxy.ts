import http from 'http';
import https from 'https';

import { createFailResponse } from '../backend-node';

import { OPENAI_API_KEY, OPENAI_BASE_PATH } from './config';
import { countToken, normalizeModel } from './encoding';
import { ChatModel, DEFAULT_MAX_TOKEN, MAX_TOKENS, ChatOptions, CHAT_API_ENDPOINT, ErrorResponse } from './constants';

function getAgent(url: URL) {
  if (url.protocol === 'https:') {
    return https;
  }

  return http;
}

/**
 * openai 接口代理
 * 注意：被代理的 API 需要开启以下配置
 *
 * export const config = {
 *   api: {
 *     externalResolver: true,
 *   },
 * }
 */
export function chat(options: ChatOptions) {
  let { model = ChatModel.GPT3_5_TURBO_0301, pipe, ...other } = options;

  model = normalizeModel(model);
  const token = countToken(options.messages, model);
  const maxToken = MAX_TOKENS[model] ?? DEFAULT_MAX_TOKEN;

  // 消息超长
  if (token > maxToken) {
    pipe.status(400).json(createFailResponse(400, '消息超长'));
    return;
  }

  const content = {
    stream: true,
    model,
    // max_tokens: maxToken - token,
    ...other,
  };

  const data = JSON.stringify(content);
  const basePath = OPENAI_BASE_PATH || 'https://api.openai.com/v1';
  const url = new URL(basePath);
  url.pathname += CHAT_API_ENDPOINT;

  const request = getAgent(url).request(url, {
    rejectUnauthorized: false,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      Host: url.host,
    },
  });

  request.on('response', response => {
    if (response.statusCode === 200 && response.headers['content-type'] === 'text/event-stream') {
      // 正常响应
      // header
      for (const headerName of Object.keys(response.headers)) {
        const header = response.headers[headerName];
        if (header) {
          pipe.setHeader(headerName, header);
        }
      }

      pipe.setHeader('Transfer-Encoding', 'chunked');

      pipe.writeHead(response.statusCode || 200);

      response.on('data', () => {
        // 这个方法实际上不属于 ServerResponse, 而是 compression 库的，
        // 执行这个方法是为了快速将结果响应到客户端
        // @ts-expect-error
        pipe.flush();
      });

      response.pipe(pipe);
    } else if (response.headers['content-type']?.startsWith('application/json')) {
      // 如果 openai 返回了错误, 通常是 json 格式
      // 读取 json
      let chunks = '';

      response.on('data', chunk => {
        chunks += chunk;
      });

      response.on('end', () => {
        const result = JSON.parse(chunks) as ErrorResponse;

        pipe.statusCode = response.statusCode! || 400;

        pipe.json(createFailResponse(result.error.code ?? 400, result.error.message));
      });
    } else {
      // 未知错误
      pipe.statusCode = 500;
      pipe.json(
        createFailResponse(500, `接收到未知的响应: ${response.statusCode} ${response.headers['content-type']}`)
      );
    }
  });

  request.on('error', e => {
    pipe.status(500);
    pipe.json(createFailResponse(500, e.message));
    console.error(`ai proxy request failed:`, e);
  });

  request.write(data);
  request.end();
}
