import { useMemo } from 'react';
import { ISubscriptionPlanInfo, PlanIdentity } from '../Lemon/share';
import { useRequestByGet } from '../backend-client';
import { createPlan } from './planInfo';

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

/**
 * 套餐是否有效 即激活并且处于有效期内
 * @param info
 * @returns
 */
function isValid(info: ISubscriptionPlanInfo): boolean {
  return info.status === 'active' && !info.cancelled;
}

function getPackageIdentify(data?: ISubscriptionPlanInfo): PlanIdentity {
  if (!data || !isValid(data)) {
    return PlanIdentity.None;
  }

  return (data.product_name as PlanIdentity) || PlanIdentity.None;
}

export function useCurrentPlan() {
  const { data, isLoading } = useRequestByGet<ISubscriptionPlanInfo>(`/api/rest/subscription/info?__s=${seed}`);
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
