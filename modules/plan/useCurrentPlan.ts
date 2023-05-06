import { useMemo } from 'react';
import { useRequestByPost } from '../backend-client';
import { PlanIdentifier, createPlan } from './planInfo';

function createRandomSeed() {
  return ~~(Math.random() * 1e8);
}

export function clearCache() {
  seed = createRandomSeed();
}
/**
 * 缓存种子
 *
 * 通过改变该种子从而让swr的缓存进行失效
 */
let seed = createRandomSeed();

export const enum SubscriptionStatus {
  open = 0,
  close = 1,
}

export interface ISubscriptionPlanInfo {
  /**
   * 订阅套餐 id
   */
  packageId: number;
  /**
   * 订阅套餐详情
   */
  planDTO?: {
    packageIdentity: PlanIdentifier;
    packageName: string;
  };
  /**
   * 订阅开始时间
   */
  subscriptionBegin: string;
  /**
   * 订阅结束时间
   */
  subscriptionEnd: string;
  /**
   * 订阅状态
   */
  subscriptionStatus: SubscriptionStatus;
}

function getPackageIdentify(data?: ISubscriptionPlanInfo): PlanIdentifier {
  if (!data || data.subscriptionStatus === SubscriptionStatus.close) {
    return PlanIdentifier.None;
  }

  return data.planDTO?.packageIdentity || PlanIdentifier.None;
}

export function useCurrentPlan() {
  const { data, isLoading } = useRequestByPost<ISubscriptionPlanInfo>(
    `/wd/visual/web/package-subscription/get-package-subscription-by-account-id?__s=${seed}`
  );
  const currentPlan = useMemo(() => {
    const packageIdentity = getPackageIdentify(data);
    return createPlan(packageIdentity);
  }, [data]);

  return {
    currentPlan,
    isLoading,
    data,
    clearCache,
  };
}
