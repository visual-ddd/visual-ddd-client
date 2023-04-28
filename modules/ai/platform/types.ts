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
}

/**
 * azure api
 */
export interface AzureApiConfiguration {
  type: 'azure';
  /**
   * 当前默认为 2023-03-15-preview
   */
  apiVersion?: string;

  /**
   * 请求路径, https://{your-resource-name}.openai.azure.com/openai/deployments/{deployment-id}
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
