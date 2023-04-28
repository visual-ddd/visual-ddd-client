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
   * 代理的响应对象
   */
  pipe: NextApiResponse;

  /**
   * 代理的请求对象
   */
  source: NextApiRequest;
}

export interface ErrorResponse {
  error: {
    message: string;
    type: string;
    param?: any;
    code?: any;
  };
}

export enum ChatModel {
  GPT3_5_TURBO = 'gpt-3.5-turbo',
  GPT3_5_TURBO_0301 = 'gpt-3.5-turbo-0301',
  GPT_4 = 'gpt-4',
  GPT_4_0314 = 'gpt-4-0314',
  GPT_4_32K = 'gpt-4-32k',
  GPT_4_32K_0314 = 'gpt-4-32k-0314',
}

export const DEFAULT_MAX_TOKEN = 4096;

export const MAX_TOKENS: Record<ChatModel, number> = {
  [ChatModel.GPT3_5_TURBO]: 4096,
  [ChatModel.GPT3_5_TURBO_0301]: 4096,
  [ChatModel.GPT_4]: 8192,
  [ChatModel.GPT_4_0314]: 8192,
  [ChatModel.GPT_4_32K]: 32768,
  [ChatModel.GPT_4_32K_0314]: 32768,
};
