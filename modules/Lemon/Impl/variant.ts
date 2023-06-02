import { Cache } from './cache';
import { get } from './request';
import { ListAllVariantsResult, VariantsResult } from './type';
import { createExpiredTime } from './utils';

const getKey = (str: string | number) => `@Variant@${str}`;

const getCache = (id: string | number) => Cache.get(getKey(id)) as any as VariantsResult['data'] | undefined;

const setCache = (id: string | number, data: VariantsResult['data']) =>
  Cache.set(getKey(id), data, createExpiredTime(1000 * 60 * 60));

const getVariantListCache = () => Cache.get(getKey('@all@')) as any as ListAllVariantsResult | undefined;

const setVariantListCache = (data: ListAllVariantsResult) =>
  Cache.set(getKey('@all@'), data, createExpiredTime(1000 * 60 * 30));

function findVariant(productId: string | number): VariantsResult['data'][] | undefined {
  const cacheValue = getCache(productId);
  if (cacheValue) {
    return [cacheValue];
  }
  return getVariantListCache()?.data.filter(item => item.attributes.product_id === productId);
}

export function getVariant(): Promise<ListAllVariantsResult>;
export function getVariant(productId: string | number): Promise<VariantsResult['data'][] | undefined>;
export async function getVariant(
  productId?: string | number
): Promise<VariantsResult['data'][] | undefined | ListAllVariantsResult> {
  const url = '/v1/variants';

  if (productId) {
    const cacheValue = findVariant(productId);

    if (cacheValue) {
      return cacheValue;
    }

    const result = await get(`${url}/${productId}`);
    setCache(productId, result);

    return result;
  }

  const listCacheValue = getVariantListCache();

  if (listCacheValue) {
    return listCacheValue;
  }

  const value = await get(url);
  setVariantListCache(value);

  return value;
}
