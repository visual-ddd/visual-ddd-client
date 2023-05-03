import { useMemo } from 'react';
import { useRequestByPost } from '../backend-client';
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

export function useCurrentPlan() {
  const { data, isLoading } = useRequestByPost(
    `/wd/visual/web/package-subscription/get-package-subscription-by-account-id?__s=${seed}`
  );
  const currentPlan = useMemo(() => createPlan(data?.planDTO.packageIdentity), [data]);
  return {
    currentPlan,
    isLoading,
    data,
    clearCache,
  };
}
