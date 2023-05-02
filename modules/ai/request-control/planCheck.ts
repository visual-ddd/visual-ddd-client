/**
 * 套餐检查
 */
import { PlanName, SupportModel } from '../plans';
import { getFreeAccountRateLimit } from '../rate-limit';
import {
  RequestControlError,
  RequestControlErrorCode,
  RequestControlHandler,
  RequestControlParams,
} from './RequestControlChain';

/**
 * 检查 套餐功能
 * @param planName
 * @param params
 */
export async function checkPlanFeature(planName: PlanName, params: RequestControlParams) {
  const { model } = params;
  const supportModels = SupportModel[planName];

  if (!supportModels.includes(model)) {
    throw new RequestControlError(RequestControlErrorCode.FeatureNotAllowed, '该功能不在套餐范围内, 请升级套餐');
  }
}

/**
 * 检查套餐 限额
 * @param planName
 * @param params
 */
export async function checkPlanLimit(planName: PlanName, params: RequestControlParams) {
  const assertPlan = (value: boolean, message?: string) => {
    if (!value) {
      throw new RequestControlError(RequestControlErrorCode.PlanExceed, message ?? '套餐限额超出, 请升级套餐');
    }
  };

  if (planName === PlanName.Free) {
    // 免费套餐限额
    const freeAccountRateLimit = getFreeAccountRateLimit();
    assertPlan(await freeAccountRateLimit.requestUsage(params.account, 1), freeAccountRateLimit.exceedMessage);
  }

  // TODO: 其他套餐限额
}

/**
 * TODO: 获取当前用户的套餐
 * @param account
 * @returns
 */
export async function getCurrentPlan(account: string) {
  return PlanName.Free;
}

/**
 * 套餐检查
 * @param params
 */
export const checkPlan: RequestControlHandler = async params => {
  const planName = await getCurrentPlan(params.account);
  await checkPlanFeature(planName, params);
  await checkPlanLimit(planName, params);
};
