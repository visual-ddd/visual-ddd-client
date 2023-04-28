import { assert } from '@/lib/utils';
import { ChatCompletionSupport, OpenAiApiConfiguration } from './types';

export function validateOpenAI(config: OpenAiApiConfiguration) {
  assert(config.key, 'key is not defined');
}

export class OpenAIChatCompletionSupport implements ChatCompletionSupport {
  endpoint = '/chat/completions';
  basePath: string;

  constructor(private config: OpenAiApiConfiguration) {
    validateOpenAI(config);

    const base = new URL(config.proxy || 'https://api.openai.com');

    if (base.pathname === '/') {
      base.pathname = '/v1';
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
