/**
 * 协议定义
 */

import { OpenAIEventSourceModel } from '../openai-event-source';

/**
 * 全局通用消息回复机器人, 全局只能有一个
 */
export const GLOBAL_EXTENSION_KEY = 'GLOBAL_EXTENSION_KEY';

export enum Role {
  System = 'system',
  Assistant = 'assistant',
  User = 'user',
}

export interface Message {
  /**
   * 唯一 id
   */
  uuid: string;

  /**
   * 角色
   */
  role: Role;

  /**
   * 消息内容
   */
  content: string;

  /**
   * 消息是否正在进行中
   */
  pending?: {
    extension: Extension;
    response: ExtensionResponse;
  };

  /**
   * 归属的扩展
   */
  extension?: string;

  /**
   * 消息的时间戳, 毫秒
   */
  timestamp: number;

  /**
   * 会话总结
   */
  summary?: string;
}

export interface IBot {
  /**
   * 最近的消息
   */
  getRecentlyMessages(): Message[];

  /**
   * 向控制台发送消息
   */
  responseMessage(message: string, extension?: Extension): void;

  /**
   * 计算 Token
   * @param message
   */
  countToken(message: string[]): number;

  /**
   * 设置消息的总结
   * @param messageId
   * @param summary
   */
  updateSummary(messageId: string, summary: string): void;
}

export interface SendParams {
  /**
   * 用户消息
   */
  message: string;

  /**
   * 机器人, 可以与机器人进行交互或者获取上下文信息等
   */
  bot: IBot;

  /**
   * 当前插件
   */
  currentTarget: Extension;
}

export enum ExtensionType {
  /**
   * 消息类型
   */
  Message = 'message',

  /**
   * 命令类型，不会响应消息，会执行命令
   */
  Command = 'command',
}

export interface ExtensionResponse {
  /**
   * 事件源
   */
  eventSource: OpenAIEventSourceModel;

  /**
   * 回收方法
   * @returns
   */
  dispose: () => void;

  /**
   * 执行结果
   */
  result: Promise<any>;
}

/**
 * 扩展
 */
export interface Extension<T = any> {
  /**
   * 扩展类型
   */
  type: ExtensionType;

  /**
   * 唯一 key, name
   */
  key: string;

  /**
   * 指令匹配, 通常需要指定才能匹配。
   * 通常全局只能有一个默认的回复机器人
   */
  match?: string;

  /**
   * 响应消息发送
   */
  onSend(params: SendParams): ExtensionResponse;
}
