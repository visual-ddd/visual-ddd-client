import { ChatModel } from '../constants';

/**
 * openai chat completion 支持
 * TODO: 模型支持声明
 */
export interface ChatCompletionSupport {
  /**
   * 调用路径
   * 比如 openai 是 /chat/completions
   */
  endpoint: string;

  /**
   * API 基础路径，比如代理地址
   */
  basePath: string;

  /**
   * 一个唯一的 id 用来标识用户
   */
  user?: string;

  /**
   * 获取查询字符串参数
   * @returns
   */
  query?: Record<string, string>;

  /**
   * 获取报头
   */
  headers: Headers;

  /**
   * 所有支持的模型
   */
  models: ChatModel[];
}

export interface OpenAISupport {
  key: string;
  basePath: string;
}

/**
 * open ai 接口配置
 */
export interface OpenAiApiConfiguration {
  type: 'openai';

  /**
   * API key
   */
  key: string;

  /**
   * 代理服务器
   */
  proxy?: string;

  /**
   * 一个唯一的 id 用来标识用户
   */
  user?: string;

  /**
   * 支持的模型, 默认支持 gpt-3.5-turbo
   */
  models?: ChatModel[];
}

/**
 * azure api 接口配置
 */
export interface AzureApiConfiguration {
  type: 'azure';

  /**
   * 使用的模型
   */
  model: ChatModel;

  /**
   * 当前默认为 2023-07-01-preview
   */
  apiVersion?: string;

  /**
   * 请求路径, 例如 https://{your-resource-name}.openai.azure.com/openai/deployments/{deployment-id}
   * 可以从 Azure OpenAI Studio 中获取这些信息
   */
  basePath: string;

  /**
   * API key
   */
  key: string;

  /**
   * 一个唯一的 id 用来标识用户
   */
  user?: string;
}

export type ApiConfiguration = OpenAiApiConfiguration | AzureApiConfiguration;
