import { post } from './request';
import { getStoreId } from './store';
import { CreateCheckoutOptions, CreateCheckoutResult, LemonsqueezyCheckout } from './type';

export function createCheckout(variantId: string, storeId?: string): Promise<CreateCheckoutResult>;
export function createCheckout(
  variantId: string,
  attributes?: Partial<LemonsqueezyCheckout['attributes']>
): Promise<CreateCheckoutResult>;
export function createCheckout(
  variantId: string,
  storeId: string,
  attributes?: Partial<LemonsqueezyCheckout['attributes']>
): Promise<CreateCheckoutResult>;
export async function createCheckout(
  variantId: string,
  storeIdOrAttributes?: string | Partial<LemonsqueezyCheckout['attributes']>,
  attributes?: Partial<LemonsqueezyCheckout['attributes']>
): Promise<CreateCheckoutResult> {
  const uri = '/v1/checkouts';
  if (typeof storeIdOrAttributes === 'string') {
    return post(uri, buildBody(variantId, storeIdOrAttributes, attributes));
  }
  return post(uri, buildBody(variantId, await getStoreId(), storeIdOrAttributes));
}

function buildBody(
  variantId: string,
  storeId: string,
  attributes?: Partial<LemonsqueezyCheckout['attributes']>
): { data: CreateCheckoutOptions } {
  return {
    data: {
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
    },
  };
}
