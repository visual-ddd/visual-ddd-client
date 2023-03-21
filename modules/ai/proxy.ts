import http from 'http';
import https from 'https';
import { NextApiResponse } from 'next';

import { createFailResponse } from '../backend-node';

import { OPENAI_API_KEY, OPENAI_BASE_PATH } from './config';

const CHAT_API_ENDPOINT = '/chat/completions';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  /**
   * 模型名，默认为 gpt-3.5-turbo
   * TODO: GPT 4 支持
   */
  model?: 'gpt-3.5-turbo' | 'gpt-3.5-turbo-0301';

  /**
   * 消息
   * 即最近的聊天记录
   */
  messages: ChatMessage[];

  /**
   * 随机性，默认为 1
   */
  temperature?: number;

  /**
   * 最大token 限制
   */
  max_tokens?: number;

  /**
   * 代理的响应对象
   */
  pipe: NextApiResponse;
}

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
  const { model = 'gpt-3.5-turbo', pipe, ...other } = options;
  const content = {
    stream: true,
    model,
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
  });

  request.on('error', e => {
    pipe.status(500);
    pipe.json(createFailResponse(500, e.message));
    console.error(`ai proxy request failed:`, e);
  });

  request.write(data);
  request.end();
}
