export const enum PlanIdentifier {
  None = 'None',
  Base = 'Base',
  Plus = 'Plus',
  PlusMax = 'PlusMax',
}

export interface IPlanInfo {
  Identifier: PlanIdentifier;
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

  level: number;
  cycleNum: number;
}
export const FreePlan: IPlanInfo = {
  Identifier: PlanIdentifier.None,
  name: '试用版',
  price: '免费',
  models: 'GPT3.5',
  requestLimit: '30次',
  modules: 'chatbot',
  onLineLimit: '2台',
  level: 1,
  concurrency: '3 / 分钟',
  cycleNum: 1,
};
export const BasePlan: IPlanInfo = {
  name: '基础版',
  price: '￥30 / 月',
  models: 'GPT3.5、GPT4',
  requestLimit: '无限制',
  modules: 'chatbot',
  concurrency: '5 / 分钟',
  onLineLimit: '3 台',
  level: 1 << 1,
  cycleNum: 1,
  Identifier: PlanIdentifier.Base,
};
export const planInfoList: IPlanInfo[] = [FreePlan, BasePlan];

export function createPlan(name: PlanIdentifier): IPlanInfo {
  switch (name) {
    case PlanIdentifier.Base:
      return BasePlan;
    default:
      return FreePlan;
  }
}

export function hasFreeLimit(planInfo: IPlanInfo): boolean {
  return planInfo.level === FreePlan.level;
}

export function hasExpiredTime(planInfo: IPlanInfo): boolean {
  return !hasFreeLimit(planInfo);
}

export function allowUpgrade(currentPlan: IPlanInfo, targetPlan: IPlanInfo): boolean {
  if (currentPlan.Identifier === PlanIdentifier.None) {
    return targetPlan.Identifier !== PlanIdentifier.None;
  }
  return targetPlan.cycleNum === currentPlan.cycleNum && allowSubscribe(currentPlan, targetPlan);
}

export function allowSubscribe(currentPlan: IPlanInfo, targetPlan: IPlanInfo): boolean {
  return targetPlan.level > currentPlan.level;
}
