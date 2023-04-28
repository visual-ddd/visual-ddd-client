import { assert } from '@/lib/utils';
import { AzureApiConfiguration, ChatCompletionSupport } from './types';

export function validateAzure(config: AzureApiConfiguration) {
  assert(config.basePath, 'endpoint is not defined');
  assert(config.key, 'key is not defined');
}

export class AzureChatCompletionSupport implements ChatCompletionSupport {
  constructor(private config: AzureApiConfiguration) {
    validateAzure(config);
  }

  get endpoint() {
    return '/chat/completions';
  }

  get basePath() {
    return this.config.basePath;
  }

  get user() {
    return this.config.user;
  }

  get query() {
    return {
      'api-version': this.config.apiVersion || '2023-03-15-preview',
    };
  }

  get headers() {
    return new Headers({
      'api-key': this.config.key,
    });
  }
}
