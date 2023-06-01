import { post } from './request';
import { getStoreId } from './store';
import { CreateCheckoutOptions, CreateCheckoutResult, LemonsqueezyCheckout } from './type';

export function createCheckout(variantId: string, storeId?: string): Promise<CreateCheckoutResult>;
export function createCheckout(
  variantId: string,
  attributes?: LemonsqueezyCheckout['attributes']
): Promise<CreateCheckoutResult>;
export function createCheckout(
  variantId: string,
  storeId: string,
  attributes?: LemonsqueezyCheckout['attributes']
): Promise<CreateCheckoutResult>;
export async function createCheckout(
  variantId: string,
  storeIdOrAttributes?: string | LemonsqueezyCheckout['attributes'],
  attributes?: LemonsqueezyCheckout['attributes']
): Promise<CreateCheckoutResult> {
  const url = '/v1/checkouts';
  if (typeof storeIdOrAttributes === 'string') {
    return post(url, buildBody(variantId, storeIdOrAttributes, attributes));
  }
  return post(url, buildBody(variantId, await getStoreId(), storeIdOrAttributes));
}


function buildBody(
  variantId: string,
  storeId: string,
  attributes?: LemonsqueezyCheckout['attributes']
): CreateCheckoutOptions {
  return {
    type: 'checkouts',
    attributes,
    relationships: {
      store: {
        data: {
          type: 'stores',
          id: storeId,
        },
      },
      variant: {
        data: {
          type: 'variants',
          id: variantId,
        },
      },
    },
  };
}
