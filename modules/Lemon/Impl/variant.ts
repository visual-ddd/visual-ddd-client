import { Cache } from './cache';
import { get } from './request';
import { ListAllVariantsResult, VariantsResult } from './type';
import { createExpiredTime } from './utils';

const getKey = (str: string | number) => `@Variant@${str}`;

const getCache = (id: string | number) => Cache.get(getKey(id)) as Promise<VariantsResult['data'] | undefined>;

const setCache = (id: string | number, data: VariantsResult['data']) =>
  Cache.set(getKey(id), data, createExpiredTime(1000 * 60 * 60));

const getVariantListCache = () => Cache.get(getKey('@all@')) as Promise<ListAllVariantsResult | undefined>;

const setVariantListCache = (data: ListAllVariantsResult) =>
  Cache.set(getKey('@all@'), data, createExpiredTime(1000 * 60 * 30));

const getCacheByProduct = (id: string) =>
  Cache.get(getKey(`@p@${id}`)) as Promise<VariantsResult['data'][] | undefined>;

const setCacheByProduct = (id: string | number, data: VariantsResult['data'][]) =>
  Cache.set(getKey(`@p@${id}`), data, createExpiredTime(1000 * 60 * 60));

async function findVariant(variantId: string | number): Promise<VariantsResult['data'] | undefined> {
  const cacheValue = await getCache(variantId);
  if (cacheValue) {
    return cacheValue;
  }
  return (await getVariantListCache())?.data.find(item => item.id === variantId);
}

const uri = '/v1/variants';

export function getVariant(): Promise<ListAllVariantsResult>;
export function getVariant(variantId: string | number): Promise<VariantsResult['data'] | undefined>;
export async function getVariant(
  variantId?: string | number
): Promise<VariantsResult['data'] | undefined | ListAllVariantsResult> {
  if (variantId) {
    const cacheValue = await findVariant(variantId);

    if (cacheValue) {
      return cacheValue;
    }

    const result = await get(`${uri}/${variantId}`);
    setCache(variantId, result);

    return result;
  }

  const listCacheValue = await getVariantListCache();

  if (listCacheValue) {
    return listCacheValue;
  }

  // todo 遍历获取所有
  const value = await get(uri);
  setVariantListCache(value);

  return value;
}

export async function getVariantByProduct(productId: string): Promise<VariantsResult['data'][]> {
  const cacheValue = await getCacheByProduct(productId);
  if (cacheValue) {
    return cacheValue;
  }

  const value = await get<ListAllVariantsResult>(uri, {
    'filter[product_id]': productId,
  });

  setCacheByProduct(productId, value.data);

  return value.data ?? [];
}
