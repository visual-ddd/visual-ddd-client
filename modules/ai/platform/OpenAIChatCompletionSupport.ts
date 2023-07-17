import { assert } from '@/lib/utils';
import { ChatCompletionSupport, OpenAiApiConfiguration } from './types';
import { ALL_SUPPORTED_CHAT_MODEL, ChatModel } from '../constants';

export function validateOpenAI(config: OpenAiApiConfiguration) {
  assert(config.key, 'key is not defined');

  if (config.models && config.models.some(i => !ALL_SUPPORTED_CHAT_MODEL.includes(i))) {
    throw new Error(`found unsupported model: ${config.models.join(', ')}`);
  }
}

/**
 *  OPEN AI Chat Completion 支持
 */
export class OpenAIChatCompletionSupport implements ChatCompletionSupport {
  endpoint = '/chat/completions';
  basePath: string;
  models: ChatModel[] = [];

  constructor(private config: OpenAiApiConfiguration) {
    validateOpenAI(config);

    const base = new URL(config.proxy || 'https://api.openai.com');

    if (base.pathname === '/') {
      base.pathname = '/v1';
    }

    if (config.models?.length) {
      this.models = config.models;
    } else {
      this.models.push(ChatModel.GPT3_5_TURBO);
    }

    this.basePath = base.href;
  }

  get user() {
    return this.config.user;
  }

  get headers() {
    return new Headers({
      Authorization: `Bearer ${this.config.key}`,
    });
  }
}
