import { get } from './request';
import { ListAllProductResult, ProductResult } from './type';
import { createExpiredTime } from './utils';
import { Cache } from './cache';

const getKey = (str: string | number) => `@Product@${str}`;

const getCache = (id: string | number) => Cache.get(getKey(id)) as Promise<ProductResult['data'] | undefined>;

const setCache = (id: string | number, data: ProductResult['data']) =>
  Cache.set(getKey(id), data, createExpiredTime(1000 * 60 * 30));

const getProductListCache = () => Cache.get(getKey('@all@')) as Promise<ListAllProductResult | undefined>;

const setProductListCache = (data: ListAllProductResult) =>
  Cache.set(getKey('@all@'), data, createExpiredTime(1000 * 60 * 10));

async function findProduct(productId: string): Promise<ProductResult['data'] | undefined> {
  return (await getCache(productId)) ?? (await getProductListCache())?.data.find(item => item.id === productId);
}

export function getProduct(): Promise<ListAllProductResult>;
export function getProduct(productId: string): Promise<ProductResult['data'] | undefined>;
export async function getProduct(
  productId?: string
): Promise<ProductResult['data'] | undefined | ListAllProductResult> {
  const url = '/v1/products';

  if (productId) {
    const cacheValue = findProduct(productId);

    if (cacheValue) {
      return cacheValue;
    }

    const result = await get(`${url}/${productId}`);
    setCache(productId, result);

    return result;
  }

  const listCacheValue = await getProductListCache();

  if (listCacheValue) {
    return listCacheValue;
  }

  const value = await get(url);
  setProductListCache(value);

  return value;
}
