import { validateOpenAI } from './OpenAIChatCompletionSupport';
import { OpenAISupport, OpenAiApiConfiguration } from './types';

/**
 * OPEN AI API 支持，能够使用 OPEN AI 开发的所有能力
 * 用于对接 langchain 这些库
 */
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
