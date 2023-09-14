import { assert } from '@/lib/utils';
import { AzureApiConfiguration, ChatCompletionSupport } from './types';
import { ALL_SUPPORTED_CHAT_MODEL, ChatModel } from '../constants';

export function validateAzure(config: AzureApiConfiguration) {
  assert(config.model, 'model is not defined');
  assert(ALL_SUPPORTED_CHAT_MODEL.includes(config.model), `model ${config.model} is not supported`);
  assert(config.basePath, 'endpoint is not defined');
  assert(config.key, 'key is not defined');
}

export class AzureChatCompletionSupport implements ChatCompletionSupport {
  readonly models: ChatModel[] = [ChatModel.GPT3_5_TURBO];

  constructor(private config: AzureApiConfiguration) {
    validateAzure(config);
    this.models = [config.model];
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
      'api-version': this.config.apiVersion || '2023-07-01-preview',
    };
  }

  get headers() {
    return new Headers({
      'api-key': this.config.key,
    });
  }
}
