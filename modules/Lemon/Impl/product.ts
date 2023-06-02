import { get } from './request';
import { ListAllProductResult, ProductResult } from './type';
import { createExpiredTime } from './utils';
import { Cache } from './cache';

const getKey = (str: string | number) => `@Product@${str}`;

const getCache = (id: string | number) => Cache.get(getKey(id)) as any as ProductResult['data'] | undefined;

const setCache = (id: string | number, data: ProductResult['data']) =>
  Cache.set(getKey(id), data, createExpiredTime(1000 * 60 * 30));

const getProductListCache = () => Cache.get(getKey('@all@')) as any as ListAllProductResult | undefined;

const setProductListCache = (data: ListAllProductResult) =>
  Cache.set(getKey('@all@'), data, createExpiredTime(1000 * 60 * 10));

function findProduct(productId: string): ProductResult['data'] | undefined {
  return getCache(productId) ?? getProductListCache()?.data.find(item => item.id === productId);
}

export function getProduct(): Promise<ListAllProductResult>;
export function getProduct(productId: string): Promise<ProductResult['data'] | undefined>;
export async function getProduct(
  productId?: string
): Promise<ProductResult['data'] | undefined | ListAllProductResult> {
  const url = '/v1/product';
  if (productId) {
    const cacheValue = findProduct(productId);

    if (cacheValue) {
      return cacheValue;
    }

    const result = await get(`${url}/${productId}`);
    setCache(productId, result);

    return result;
  }

  const listCacheValue = getProductListCache();

  if (listCacheValue) {
    return listCacheValue;
  }

  const value = await get(url);
  setProductListCache(value);

  return value;
}
