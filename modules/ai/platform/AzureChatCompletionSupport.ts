import { assert } from '@/lib/utils';
import { AzureApiConfiguration, ChatCompletionSupport } from './types';
import { ChatModel } from '../constants';

export function validateAzure(config: AzureApiConfiguration) {
  assert(config.basePath, 'endpoint is not defined');
  assert(config.key, 'key is not defined');
}

export class AzureChatCompletionSupport implements ChatCompletionSupport {
  // TODO: 后面支持 azure 的其他模型，默认仅支持 3.5
  readonly models: ChatModel[] = [ChatModel.GPT3_5_TURBO];

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
