export const CHAT_API_ENDPOINT = '/chat/completions';
import type { NextApiRequest, NextApiResponse } from 'next';

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  name?: string;
  content: string;
}

export interface ChatOptions {
  /**
   * 模型名，默认为 gpt-3.5-turbo
   * TODO: GPT 4 支持
   */
  model?: ChatModel;

  /**
   * 消息
   * 即最近的聊天记录
   */
  messages: ChatMessage[];

  /**
   * 随机性，默认为 1
   */
  temperature?: number;

  /**
   * 最大token 限制
   */
  max_tokens?: number;

  /**
   * 终止字符
   */
  stop?: string | string[];

  /**
   * 是否使用流, 默认 true
   */
  stream?: boolean;

  /**
   * 是否保留原有格式
   */
  preserve?: boolean;

  /**
   * 代理的响应对象
   */
  pipe: NextApiResponse;

  /**
   * 代理的请求对象
   */
  source: NextApiRequest;

  /**
   * 业务编码
   */
  bzCode: string;

  /**
   * 业务描述
   */
  bzDesc: string;
}

export interface ErrorResponse {
  error: {
    message: string;
    type: string;
    param?: any;
    code?: any;
  };
}

/**
 * ChatGPT 模型
 * ChatGPT 会定期废弃一些模型 https://platform.openai.com/docs/deprecations
 * 所以这里我们就不耦合具体时间段的模型了
 */
export enum ChatModel {
  GPT3_5_TURBO = 'gpt-3.5-turbo',

  /**
   * 16K 版本
   */
  GPT3_5_TURBO_16K = 'gpt-3.5-turbo-16k',

  /**
   * 最大支持 8 k
   */
  GPT_4 = 'gpt-4',

  GPT_4_32K = 'gpt-4-32k',
}

export const ALL_SUPPORTED_CHAT_MODEL = [
  ChatModel.GPT3_5_TURBO,
  ChatModel.GPT3_5_TURBO_16K,
  ChatModel.GPT_4,
  ChatModel.GPT_4_32K,
];

/**
 * 图像模型
 */
export enum ImageModel {
  DALL_E = 'dall-e',
}

export type AllSupportedModel = ChatModel | ImageModel;

export const DEFAULT_MAX_TOKEN = 4096;

export const MAX_TOKENS: Record<ChatModel, number> = {
  [ChatModel.GPT3_5_TURBO]: 4096,
  [ChatModel.GPT3_5_TURBO_16K]: 16384,
  [ChatModel.GPT_4]: 8192,
  [ChatModel.GPT_4_32K]: 32768,
};
