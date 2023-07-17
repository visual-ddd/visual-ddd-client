import { assert, randomPick } from '@/lib/utils';
import memoize from 'lodash/memoize';

import { AzureChatCompletionSupport } from './AzureChatCompletionSupport';
import { OpenAIChatCompletionSupport } from './OpenAIChatCompletionSupport';
import { OpenAISupportImplement } from './OpenAISupportImplement';
import { ApiConfiguration, ChatCompletionSupport, OpenAISupport } from './types';
import { ChatModel } from '../constants';

const OPEN_AI_SUPPORT: OpenAISupport[] = [];
const CHAT_COMPLETION_SUPPORT: ChatCompletionSupport[] = [];

export function parseApiConfiguration(config: string) {
  const configs = JSON.parse(config) as ApiConfiguration[];

  for (const item of configs) {
    if (item.type === 'azure') {
      CHAT_COMPLETION_SUPPORT.push(new AzureChatCompletionSupport(item));
    } else if (item.type === 'openai') {
      CHAT_COMPLETION_SUPPORT.push(new OpenAIChatCompletionSupport(item));
      OPEN_AI_SUPPORT.push(new OpenAISupportImplement(item));
    } else {
      throw new Error(`Unsupported api config: ${JSON.stringify(item)}`);
    }
  }

  assert(CHAT_COMPLETION_SUPPORT.length > 0, 'No chat completion support');
}

const AI_CONFIGURATION = process.env.AI_CONFIGURATION as string;

if (!AI_CONFIGURATION) {
  console.warn('AI_CONFIGURATION is not defined');
} else {
  parseApiConfiguration(AI_CONFIGURATION);
}

/**
 * 获取聊天补全 API 支持
 * @returns
 */
export function getChatCompletionSupport() {
  return randomPick(CHAT_COMPLETION_SUPPORT);
}

/**
 * 获取所有支持的模型
 */
export const getSupportedModels = memoize((): ChatModel[] => {
  const list: ChatModel[] = [];

  for (const i of CHAT_COMPLETION_SUPPORT) {
    for (const m of i.models) {
      if (!list.includes(m)) {
        list.push(m);
      }
    }
  }

  return list;
});

/**
 * 获取 OpenAI API 支持
 * @returns
 */
export function getOpenAISupport() {
  return randomPick(OPEN_AI_SUPPORT);
}
