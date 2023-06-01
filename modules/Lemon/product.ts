import { get } from './request';
import { ListAllProductResult, ProductResult } from './type';

let allListCache: ListAllProductResult;
let cache: Record<string, ProductResult> = {};

function findProduct(productId: string): ProductResult {
  return cache[productId] ?? allListCache?.data.find(item => item.id === productId);
}

export function getProduct(): Promise<ListAllProductResult>;
export function getProduct(productId: string): Promise<ProductResult | undefined>;
export async function getProduct(productId?: string): Promise<ProductResult | undefined | ListAllProductResult> {
  const url = '/v1/product';
  if (productId) {
    const result = findProduct(productId) ?? (await get(`${url}/${productId}`));
    cache[productId] ??= result;
    return result;
  }

  allListCache ??= await get(url);
  return allListCache;
}
