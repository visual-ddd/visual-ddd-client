import { AllSupportedModel, ChatModel, ImageModel } from './constants';

/**
 * 套餐声明
 */
export enum PlanName {
  Free = 'free',
  Pro = 'pro',
  ProMax = 'proMax',
}

export const ALL_SUPPORTED_PLANS = [PlanName.Free, PlanName.Pro, PlanName.ProMax];

/**
 * 套餐支持的模型
 */
export const SupportModel: Record<PlanName, AllSupportedModel[]> = {
  [PlanName.Free]: [ChatModel.GPT3_5_TURBO],
  [PlanName.Pro]: [ChatModel.GPT3_5_TURBO, ChatModel.GPT3_5_TURBO_16K],
  [PlanName.ProMax]: [
    ChatModel.GPT3_5_TURBO,
    ChatModel.GPT3_5_TURBO_16K,
    ChatModel.GPT_4,
    ChatModel.GPT_4_32K,

    // 图像
    ImageModel.DALL_E,
  ],
};
