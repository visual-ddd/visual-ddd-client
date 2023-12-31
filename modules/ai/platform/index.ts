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
  console.warn('AI_CONFIGURATION 未定义, AI 相关的功能将不可用');
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
 * 是否支持 chat
 * @returns
 */
export function chatSupported() {
  return getSupportedModels().length > 0;
}

/**
 * 获取 OpenAI API 支持
 * @returns
 */
export function getOpenAISupport() {
  return randomPick(OPEN_AI_SUPPORT);
}

export function getOpenAIBaseUrl() {
  return OPEN_AI_SUPPORT.find(i => !!i.basePath)?.basePath;
}
