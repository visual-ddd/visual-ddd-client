import { Noop } from '@wakeapp/utils';
import { createStaticOpenAIEventSourceModel } from '../openai-event-source';
import { ExtensionResponse } from './protocol';

/**
 * 直接响应字符串
 * @param message
 * @returns
 */
export function responseMessage(message: string): ExtensionResponse {
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
