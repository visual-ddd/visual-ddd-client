import { captureException } from '@sentry/nextjs';
import { ParsedEvent, ReconnectInterval, createParser } from 'eventsource-parser';
import { isAbort } from '@/lib/utils';

import { createFailResponse } from '../backend-node';

import { OPENAI_API_KEY, OPENAI_BASE_PATH } from './config';
import { countToken, normalizeModel } from './encoding';
import { ChatModel, DEFAULT_MAX_TOKEN, MAX_TOKENS, ChatOptions, CHAT_API_ENDPOINT, ErrorResponse } from './constants';
import { ChatCompletion, ChatCompletionInStream } from './types';

const DONE = '[DONE]';

export function getResponseContentInStream(response: ChatCompletionInStream) {
  const { choices } = response;

  return choices.map(choice => choice.delta.content ?? '').join('');
}

export function getResponseContent(response: ChatCompletion) {
  const { choices } = response;

  return choices.map(choice => choice.message.content ?? '').join('');
}

/**
 * openai chat 接口代理
 * 注意：被代理的 API 需要开启以下配置
 *
 * TODO: 统计 token 数量
 *
 * export const config = {
 *   api: {
 *     externalResolver: true,
 *   },
 * }
 */
export async function chat(options: ChatOptions) {
  let { model = ChatModel.GPT3_5_TURBO_0301, source, pipe, ...other } = options;

  model = normalizeModel(model);
  const token = countToken(options.messages, model);
  const maxToken = MAX_TOKENS[model] ?? DEFAULT_MAX_TOKEN;

  // 消息超长
  if (token > maxToken) {
    pipe.status(400).json(createFailResponse(400, '消息超长'));

    captureException(new Error(`ChatGPT 消息超长: ${JSON.stringify(options)}`));
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

  try {
    const abortController = new AbortController();

    source.on('error', e => {
      if (e.message === 'aborted') {
        // 取消
        abortController.abort();
      } else {
        console.error(`ai source request failed:`, e);
      }
    });

    const response = await fetch(url, {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': String(Buffer.byteLength(data)),
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        Host: url.host,
      },
      signal: abortController.signal,
    });

    if (!response.ok) {
      if (response.headers.get('content-type')?.startsWith('application/json')) {
        // openai 返回错误信息
        const result = (await response.json()) as ErrorResponse;
        pipe.statusCode = response.status || 400;
        pipe.json(createFailResponse(result.error.code ?? 400, result.error.message));
        return;
      }

      // 响应失败
      // 未知错误
      pipe.statusCode = 500;
      pipe.json(
        createFailResponse(500, `接收到未知的响应: ${response.status} ${response.headers.get('content-type')}`)
      );
      return;
    } else if (content.stream && response.headers.get('content-type')?.includes('event-stream')) {
      // 正常响应
      const decoder = new TextDecoder();
      const parser = createParser((evt: ParsedEvent | ReconnectInterval) => {
        if (pipe.closed || pipe.destroyed) {
          return;
        }

        if (evt.type === 'event') {
          const d = evt.data;
          if (d === DONE) {
            // 完成
            pipe.end();
          } else {
            const payload = JSON.parse(d) as ChatCompletionInStream;
            const result = getResponseContentInStream(payload);
            pipe.write(Buffer.from(result));
            // 这个方法实际上不属于 ServerResponse, 而是 compression 库的，
            // 执行这个方法是为了快速将结果响应到客户端
            // @ts-expect-error
            pipe.flush();
          }
        }
      });

      pipe.statusCode = 200;
      pipe.setHeader('Content-Type', 'text/plain');

      for await (const chunk of response.body as any) {
        parser.feed(decoder.decode(chunk, { stream: true }));
      }
    } else if (response.headers.get('content-type')?.startsWith('application/json')) {
      // 普通响应方式
      pipe.statusCode = 200;
      pipe.setHeader('Content-Type', 'text/plain');
      const payload = (await response.json()) as ChatCompletion;
      const result = getResponseContent(payload);
      pipe.write(Buffer.from(result));
      pipe.end();
    } else {
      throw new Error(`未知响应类型: ${response.headers.get('content-type')}`);
    }
  } catch (err) {
    if (isAbort(err)) {
      // 取消
      pipe.statusCode = 400;
      pipe.json(createFailResponse(400, '请求已取消'));
    } else {
      pipe.statusCode = 500;
      pipe.json(createFailResponse(500, `请求异常: ${(err as Error).message}`));
      console.error(err);
      captureException(err);
    }
  }
}
