import { validateOpenAI } from './OpenAIChatCompletionSupport';
import { OpenAISupport, OpenAiApiConfiguration } from './types';

export class OpenAISupportImplement implements OpenAISupport {
  basePath: string;
  key: string;

  constructor(config: OpenAiApiConfiguration) {
    validateOpenAI(config);

    const base = new URL(config.proxy || 'https://api.openai.com');

    if (base.pathname === '/') {
      base.pathname = '/v1';
    }

    this.basePath = base.href;
    this.key = config.key;
  }
}
