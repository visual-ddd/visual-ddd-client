import { captureException } from '@sentry/nextjs';
import { ParsedEvent, ReconnectInterval, createParser } from 'eventsource-parser';
import { assert, isAbort } from '@/lib/utils';

import { createFailResponse } from '../backend-node';

import { countToken, countTokenForString } from './encoding';
import { ChatModel, DEFAULT_MAX_TOKEN, MAX_TOKENS, ChatOptions, ErrorResponse } from './constants';
import { ChatCompletion, ChatCompletionInStream } from './types';
import { getChatCompletionSupport } from './platform';
import { checkRequest, RequestControlError } from './request-control';
import { reportUsage } from './usage';

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
  let { model = ChatModel.GPT3_5_TURBO, source, pipe, bzCode, bzDesc, ...other } = options;
  assert(source.session.content, '会话信息不存在');

  const token = countToken(options.messages, model);
  const maxToken = MAX_TOKENS[model] ?? DEFAULT_MAX_TOKEN;

  // 消息超长
  if (token > maxToken) {
    pipe.status(400).json(createFailResponse(400, '消息超长'));

    captureException(new Error(`ChatGPT 消息超长: ${JSON.stringify(options)}`));
    return;
  }

  try {
    // 请求控制
    await checkRequest({
      account: source.session.content!.accountNo,
      model,
      amount: token,
    });

    const support = getChatCompletionSupport();

    const content = {
      stream: true,
      model,
      user: support.user,
      // max_tokens: maxToken - token,
      ...other,
    };

    const data = JSON.stringify(content);
    const basePath = support.basePath;
    const url = new URL(basePath);
    url.pathname += support.endpoint;
    const query = support.query;
    const headers = new Headers(support.headers);

    // 查询字符串
    if (query) {
      for (const q in query) {
        url.searchParams.set(q, query[q]);
      }
    }

    const abortController = new AbortController();

    source.on('error', e => {
      if (e.message === 'aborted') {
        // 取消
        abortController.abort();
      } else {
        console.error(`ai source request failed:`, e);
      }
    });

    headers.set('Content-Type', 'application/json');
    headers.set('Content-Length', String(Buffer.byteLength(data)));
    headers.set('Host', url.host);

    const response = await fetch(url, {
      method: 'POST',
      body: data,
      headers,
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
      // 流响应
      let completion = '';
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
            completion += result;
            // 这个方法实际上不属于 ServerResponse, 而是 compression 库的，
            // 执行这个方法是为了快速将结果响应到客户端
            // @ts-expect-error
            pipe.flush();
          }
        }
      });

      pipe.statusCode = 200;
      pipe.setHeader('Content-Type', 'text/plain');
      pipe.on('close', () => {
        if (!completion) {
          return;
        }

        reportUsage(source, {
          model,
          code: bzCode,
          desc: bzDesc,
          requestToken: token,
          responseToken: countTokenForString(completion, model),
        });
      });

      for await (const chunk of response.body as any) {
        const txt = decoder.decode(chunk, { stream: true });
        parser.feed(txt);
      }

      // FIXME: 修复 azure 无法终止问题
      parser.feed('\n');
    } else if (response.headers.get('content-type')?.startsWith('application/json')) {
      // 普通响应方式
      pipe.statusCode = 200;
      pipe.setHeader('Content-Type', 'text/plain');
      const payload = (await response.json()) as ChatCompletion;
      const result = getResponseContent(payload);

      reportUsage(source, {
        model,
        code: bzCode,
        desc: bzDesc,
        requestToken: payload.usage.prompt_tokens,
        responseToken: payload.usage.completion_tokens,
      });

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
    } else if (RequestControlError.isRequestControlError(err)) {
      // 请求控制限制
      pipe.status(400).json(createFailResponse(err.code, err.message));
    } else {
      pipe.statusCode = 500;
      pipe.json(createFailResponse(500, `请求异常: ${(err as Error).message}`));
      console.error(err);
      captureException(err);
    }
  }
}
