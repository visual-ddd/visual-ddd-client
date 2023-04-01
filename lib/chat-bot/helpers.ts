import { Noop } from '@wakeapp/utils';
import { createStaticOpenAIEventSourceModel } from '../openai-event-source';
import { ExtensionResponse, ExtensionType, SendParams } from './protocol';

/**
 * 直接响应字符串
 * @param message
 * @returns
 */
export function responseMessage(message: string, context: SendParams): ExtensionResponse {
  const { currentTarget } = context;

  if (currentTarget.type === ExtensionType.Command) {
    context.bot.responseMessage(message, context.currentTarget);
  }

  const eventSource = createStaticOpenAIEventSourceModel(message, undefined);

  return {
    eventSource,
    result: Promise.resolve(),
    dispose: Noop,
  };
}

export class ResponseError extends Error {
  static isResponseError(error: any): error is ResponseError {
    return error && error instanceof ResponseError;
  }

  static create(message: string) {
    return new ResponseError(message);
  }

  readonly isResponseError = true;

  constructor(message: string) {
    super(message);
  }
}
