/**
 * 请求控制
 */
import { NextApiRequest } from 'next';
import { AllSupportedModel } from '../constants';
import { RequestControlErrorCode } from '../shared';

export { RequestControlErrorCode } from '../shared';

/**
 * 模型
 */
export type RequestControlModel = AllSupportedModel;

export interface RequestControlParams {
  /**
   * 用户标识符
   */
  account: string;

  /**
   * AI 的模型
   */
  model: RequestControlModel;

  /**
   * 请求数量, 这是一个抽象的概念。对于文本生成类可能是 token 数量，对于画图类可能是图片生成时间
   */
  amount: number;

  /**
   * 原始请求
   */
  rawRequest: NextApiRequest;
}

/**
 * 如果失败则抛出错误,
 */
export type RequestControlHandler = (params: RequestControlParams) => Promise<void>;

/**
 * 错误类
 */
export class RequestControlError extends Error {
  static isRequestControlError(error: any): error is RequestControlError {
    return error instanceof RequestControlError;
  }

  readonly code: RequestControlErrorCode;

  constructor(code: RequestControlErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

const RequestControlChain: RequestControlHandler[] = [];

/**
 * 添加请求控制处理器
 */
export function addRequestControlHandler(handler: RequestControlHandler) {
  RequestControlChain.push(handler);
}

/**
 * 请求控制
 * @param params
 */
export async function checkRequest(params: RequestControlParams) {
  for (const handle of RequestControlChain) {
    await handle(params);
  }
}
