import { AllSupportedModel, ChatModel, ImageModel } from './constants';

/**
 * 套餐声明
 */
export enum PlanName {
  Free = 'free',
  Pro = 'pro',
  ProMax = 'proMax',
}

/**
 * 套餐支持的模型
 */
export const SupportModel: Record<PlanName, AllSupportedModel[]> = {
  [PlanName.Free]: [ChatModel.GPT3_5_TURBO, ChatModel.GPT3_5_TURBO_0301],
  [PlanName.Pro]: [ChatModel.GPT3_5_TURBO, ChatModel.GPT3_5_TURBO_0301],
  [PlanName.ProMax]: [
    ChatModel.GPT3_5_TURBO,
    ChatModel.GPT3_5_TURBO_0301,
    ChatModel.GPT_4,
    ChatModel.GPT_4_0314,
    ChatModel.GPT_4_32K,
    ChatModel.GPT_4_32K_0314,

    // 图像
    ImageModel.DALL_E,
  ],
};
