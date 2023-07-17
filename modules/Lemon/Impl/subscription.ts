import { DELETE, get, patch } from './request';
import {
  ListAllSubscriptionsResult,
  PauseSubscriptionOptions,
  SubscriptionsResult,
  UpdateSubscriptionOptions,
  UpdateSubscriptionResult,
} from './type';

export function getSubscriptionInfo(): Promise<ListAllSubscriptionsResult>;
export function getSubscriptionInfo(id: string): Promise<SubscriptionsResult>;
export async function getSubscriptionInfo(id?: string): Promise<SubscriptionsResult | ListAllSubscriptionsResult> {
  const url = '/v1/subscriptions';
  if (id) {
    return get(`${url}/${id}`);
  }
  return get(url);
}

export async function updateSubscription(body: UpdateSubscriptionOptions): Promise<UpdateSubscriptionResult> {
  const { id, variantId, productId, ...other } = body;
  return patch(`/v1/subscriptions/${body.id}`, {
    data: {
      type: 'subscriptions',
      id,
      attributes: {
        variant_id: variantId,
        product_id: productId,
        ...other,
      },
    },
  });
}

export async function cancelSubscription(id: string): Promise<UpdateSubscriptionResult> {
  return DELETE(`/v1/subscriptions/${id}`);
}

export async function pauseSubscription(id: string): Promise<UpdateSubscriptionResult> {
  return patch<any, PauseSubscriptionOptions>(`/v1/subscriptions/${id}`, {
    data: {
      id,
      attributes: {
        pause: {
          mode: 'free',
        },
      },
    },
  });
}

export async function unPauseSubscription(id: string): Promise<UpdateSubscriptionResult> {
  return patch<any, PauseSubscriptionOptions>(`/v1/subscriptions/${id}`, {
    data: {
      id,
      attributes: {
        pause: null,
      },
    },
  });
}