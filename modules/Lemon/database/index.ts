import { getPersistenceCacheStorage } from '@/modules/storage';
import { LemonsqueezyOrderOfWebhook, LemonsqueezySubscriptionOfWebhook } from '../Impl/type';

interface Custom {
  custom: Record<string, string>;
}

export const SubscriptionCollection = getPersistenceCacheStorage<LemonsqueezySubscriptionOfWebhook & Custom>(
  '@subscription@'
);
export const OrderCollection = getPersistenceCacheStorage<LemonsqueezyOrderOfWebhook & Custom>('@order@');
