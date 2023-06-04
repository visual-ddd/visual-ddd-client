import { CacheStorageInMemory } from '@/modules/storage';
import { LemonsqueezyOrderOfWebhook, LemonsqueezySubscriptionOfWebhook } from '../Impl/type';

interface Custom {
  custom: Record<string, string>;
}

export const SubscriptionCollection = new CacheStorageInMemory<LemonsqueezySubscriptionOfWebhook & Custom>();
export const OrderCollection = new CacheStorageInMemory<LemonsqueezyOrderOfWebhook & Custom>();
