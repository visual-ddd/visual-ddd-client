import { get } from './request';
import { ListAllVariantsResult, VariantsResult } from './type';

let allListCache: ListAllVariantsResult;
let cache: Record<string, VariantsResult> = {};

function findVariant(productId: string): VariantsResult {
  return cache[productId] ?? allListCache?.data.find(item => item.id === productId);
}

export function getVariant(): Promise<ListAllVariantsResult>;
export function getVariant(productId: string): Promise<VariantsResult | undefined>;
export async function getVariant(productId?: string): Promise<VariantsResult | undefined | ListAllVariantsResult> {
  const url = '/v1/variants';
  if (productId) {
    const result = findVariant(productId) ?? (await get(`${url}/${productId}`));
    cache[productId] ??= result;
    return result;
  }

  allListCache ??= await get(url);
  return allListCache;
}
