import { PlanIdentity } from '../Lemon/share';

export interface IPlanInfo {
  Identifier: PlanIdentity;
  name: string;
  price: string;

  /**
   * 允许使用的 chatModel
   */
  models: string;
  /**
   * 请求限制
   */
  requestLimit: string;
  /**
   * 支持的功能
   */
  modules: string;
  /**
   * 同时在线限制
   */
  onLineLimit: string;
  /**
   * 并发限制
   */
  concurrency: string;

  priceValue: string;
}
export const FreePlan: IPlanInfo = {
  Identifier: PlanIdentity.None,
  name: '试用版',
  price: '免费',
  priceValue: '0',
  models: 'GPT 3.5',
  requestLimit: '30次（终生）',
  modules: 'chatbot',
  onLineLimit: '2台',
  concurrency: '3 / 分钟',
};
export const BasePlan: IPlanInfo = {
  name: '基础版',
  price: '￥30 / 月',
  priceValue: '￥30',
  models: 'GPT 3.5、GPT 4',
  requestLimit: '无限制',
  modules: 'chatbot',
  concurrency: '5 / 分钟',
  onLineLimit: '3 台',
  Identifier: PlanIdentity.Base,
};
export const PlusPlan: IPlanInfo = {
  name: '高级版',
  price: '￥60 / 月',
  priceValue: '￥60',
  models: 'GPT 3.5、GPT 4',
  requestLimit: '无限制',
  modules: 'chatbot',
  concurrency: '5 / 分钟',
  onLineLimit: '3 台',
  Identifier: PlanIdentity.Plus,
};

export const planInfoList: IPlanInfo[] = [FreePlan, BasePlan];

export function createPlan(name: PlanIdentity): IPlanInfo {
  switch (name) {
    case PlanIdentity.Base:
      return BasePlan;
    default:
      return FreePlan;
  }
}

export function hasFreeLimit(planInfo: IPlanInfo): boolean {
  return planInfo.Identifier === PlanIdentity.None;
}

export function hasExpiredTime(planInfo: IPlanInfo): boolean {
  return !hasFreeLimit(planInfo);
}

export function allowUpgrade(currentPlan: IPlanInfo, targetPlan: IPlanInfo): boolean {
  if (currentPlan.Identifier === PlanIdentity.None) {
    return true;
  }
  return currentPlan.Identifier !== targetPlan.Identifier;
}

export function allowSubscribe(currentPlan: IPlanInfo, targetPlan: IPlanInfo): boolean {
  return true;
}
