import { allowMethod } from '@/lib/api';
import { assert } from '@/lib/utils';
import { createFailResponse, createSuccessResponse } from '@/modules/backend-node';
import { withSessionApiRoute } from '@/modules/session/api-helper';
import { createCheckout } from '../Impl/checkout';
import { getProduct } from '../Impl/product';
import { getStoreId } from '../Impl/store';
import {
  getSubscriptionInfo as getSubscriptionInfoAPI,
  pauseSubscription as pauseSubscriptionAPI,
  unPauseSubscription as unPauseSubscriptionAPI,
  updateSubscription as updateSubscriptionAPI,
} from '../Impl/subscription';
import { ProductResult } from '../Impl/type';
import { getVariantByProduct } from '../Impl/variant';
import { SubscriptionCollection } from '../database';
import { PlanIdentity } from '../enum';

// TODO 返回数据后转化
async function get(userId: string): Promise<any | null> {
  assert(userId, '缺少用户ID');
  const subscriptionId = (await SubscriptionCollection.get(userId))?.id;
  if (subscriptionId) {
    const res = await getSubscriptionInfoAPI(subscriptionId);
    return res.data.attributes;
  }
  return null;
}

async function findProductByPlanName(planName: PlanIdentity): Promise<ProductResult['data']> {
  const productList = await getProduct();
  const product = productList.data.find(item => item.attributes.name === planName);
  if (!product) {
    throw new Error(`无法找到指定商品: ${planName}`);
  }
  return product;
}

async function subscribe(
  identity: PlanIdentity,
  payload: {
    email?: string;

    userId: string;
  }
): Promise<string> {
  assert(payload.userId, '缺少用户ID');
  const subscriptionId = (await SubscriptionCollection.get(payload.userId))?.id;

  assert(!subscriptionId, '当前用户已存在订阅信息');

  const [store_id, product] = await Promise.all([getStoreId(), findProductByPlanName(identity)]);
  const variant = (await getVariantByProduct(product.id))[0];
  const checkout = await createCheckout(variant.id, store_id, {
    checkout_data: {
      custom: {
        userId: payload.userId,
      },
      email: payload.email,
    },
    // TODO 这里Lemon 存在问题 需要额外加上对应的时区误差才行
    // expires_at: createExpiredTimeToISOString(1000 * 60 * 10),
  });

  return checkout.data.attributes.url;
}

async function update(identity: PlanIdentity, payload: { userId: string }): Promise<string> {
  assert(payload.userId, '缺少用户ID');
  const subscriptionId = (await SubscriptionCollection.get(payload.userId))?.id;
  assert(subscriptionId, '当前用户没有订阅');

  const product = await findProductByPlanName(identity);
  const variant = (await getVariantByProduct(product.id))[0];

  const res = await updateSubscriptionAPI({
    id: subscriptionId,
    productId: product.id,
    variantId: variant.id,
  });

  if (res.errors) {
    throw new Error(res.errors[0]!.detail);
  }

  assert(!(res.data.attributes.cancelled || res.data.attributes.pause), '当前用户不支持升级套餐');

  return res.data.attributes.urls.update_payment_method;
}

async function pause(userId: string): Promise<void> {
  assert(userId, '缺少用户ID');
  const subscriptionId = (await SubscriptionCollection.get(userId))?.id;
  assert(subscriptionId, '当前用户没有订阅');
  await pauseSubscriptionAPI(subscriptionId);
}

async function unPause(userId: string): Promise<void> {
  assert(userId, '缺少用户ID');
  const subscriptionId = (await SubscriptionCollection.get(userId))?.id;
  assert(subscriptionId, '当前用户没有订阅');
  await unPauseSubscriptionAPI(subscriptionId);
}

export const getSubscriptionInfo = allowMethod(
  'GET',
  withSessionApiRoute(async (req, res) => {
    const session = req.session.content!;
    try {
      const data = await get(session.accountNo);

      res.json(createSuccessResponse(data || {}));
    } catch (e: any) {
      res.json(createFailResponse(e.status ?? 500, e.message));
    }
  })
);

export const createSubscription = allowMethod(
  'POST',
  withSessionApiRoute(async (req, res) => {
    const body = req.body;
    const session = req.session.content!;
    try {
      const payUrl = await subscribe(body.identity, {
        email: session.accountNo,
        userId: session.accountNo,
      });

      res.json(
        createSuccessResponse({
          url: payUrl,
        })
      );
    } catch (e: any) {
      console.warn(e);
      res.json(createFailResponse(e.status ?? 500, e.message));
    }
  })
);

export const updateSubscription = allowMethod(
  'POST',
  withSessionApiRoute(async (req, res) => {
    const body = req.body;
    const session = req.session.content!;

    try {
      const url = await update(body.identity, {
        userId: session.accountNo,
      });

      res.json(
        createSuccessResponse({
          url,
        })
      );
    } catch (e: any) {
      res.json(createFailResponse(e.status ?? 500, e.message));
    }
  })
);

export const pauseSubscription = allowMethod(
  'POST',
  withSessionApiRoute(async (req, res) => {
    const session = req.session.content!;
    try {
      await pause(session.accountNo);

      res.json(createSuccessResponse({}));
    } catch (e: any) {
      res.json(createFailResponse(e.status ?? 500, e.message));
    }
  })
);

export const unpauseSubscription = allowMethod(
  'POST',
  withSessionApiRoute(async (req, res) => {
    const session = req.session.content!;

    try {
      await unPause(session.accountNo);

      res.json(createSuccessResponse({}));
    } catch (e: any) {
      res.json(createFailResponse(e.status ?? 500, e.message));
    }
  })
);
