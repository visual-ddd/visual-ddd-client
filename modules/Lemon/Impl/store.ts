import { get } from './request';
import { ListAllStoresResult } from './type';

let defaultStoreId = process.env.LEMON_STORE_ID;

export async function getAllStore(): Promise<ListAllStoresResult> {
  return await get('/v1/stores');
}

export async function getStoreId(): Promise<string> {
  defaultStoreId ??= (await getAllStore()).data[0].id as string;

  return defaultStoreId!;
}
