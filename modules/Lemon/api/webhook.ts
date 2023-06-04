import { allowMethod } from '@/lib/api';
import { assert } from '@/lib/utils';
import crypto from 'crypto';
import type { Readable } from 'node:stream';
import { LemonsqueezyOrderOfWebhook, LemonsqueezySubscriptionOfWebhook } from '../Impl/type';
import { OrderCollection, SubscriptionCollection } from '../database';

const secret = process.env.LEMON_SECRET!;

assert(secret, '缺少 LEMON SECRET');

async function checkSignature(headers: Record<string, any>, rawBody: Buffer): Promise<void> {
  const rawSignature = headers['x-signature'] as string | undefined;
  if (!rawSignature) {
    throw new Error('Missing signature.');
  }
  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
  const signature = Buffer.from(rawSignature, 'utf8');
  if (!crypto.timingSafeEqual(digest, signature)) {
    throw new Error('Invalid signature.');
  }
}

async function getRawBody(readable: Readable): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

enum WebhookType {
  order_created = 'order_created',
  order_refunded = 'order_refunded',
  subscription_created = 'subscription_created',
  subscription_updated = 'subscription_updated',
  subscription_cancelled = 'subscription_cancelled',
  subscription_resumed = 'subscription_resumed',
  subscription_expired = 'subscription_expired',
  subscription_paused = 'subscription_paused',
  subscription_unpaused = 'subscription_unpaused',
}

function save(
  type: WebhookType.order_created | WebhookType.order_refunded,
  data: LemonsqueezyOrderOfWebhook,
  custom: Record<string, string>
): void;
function save(
  type:
    | WebhookType.subscription_created
    | WebhookType.subscription_cancelled
    | WebhookType.subscription_expired
    | WebhookType.subscription_paused
    | WebhookType.subscription_resumed
    | WebhookType.subscription_unpaused
    | WebhookType.subscription_updated,
  data: LemonsqueezySubscriptionOfWebhook,
  custom: Record<string, string>
): void;
function save(
  type: WebhookType,
  data: LemonsqueezyOrderOfWebhook | LemonsqueezySubscriptionOfWebhook,
  custom: Record<string, string>
): void {
  const value = {
    ...data,
    custom,
  };
  const userId = custom.userId;
  if (!userId) {
    throw new Error('Missing UserId');
  }
  switch (type) {
    case WebhookType.order_created:
    case WebhookType.order_refunded:
      OrderCollection.set(userId, value as any);
      break;
    case WebhookType.subscription_created:
    case WebhookType.subscription_updated:
    case WebhookType.subscription_cancelled:
    case WebhookType.subscription_resumed:
    case WebhookType.subscription_expired:
    case WebhookType.subscription_paused:
    case WebhookType.subscription_unpaused:
      SubscriptionCollection.set(userId, value as any);
      break;
  }
}

export const webhook = allowMethod('POST', async (req, res) => {
  try {
    const rawBody = await getRawBody(req);
    checkSignature(req.headers, rawBody);
    const body = JSON.parse(Buffer.from(rawBody).toString('utf8'));
    const {
      meta: { event_name, custom_data },
      data,
    } = body;
    save(event_name, data, custom_data);
    res.status(200).end();
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});
