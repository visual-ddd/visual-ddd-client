import { allowMethod } from '@/lib/api';
import { withSessionApiRoute } from '@/modules/session/api-helper';
import { createSuccessResponse } from '@/modules/backend-node';
import { createCheckout } from '../Impl/checkout';
import { getProduct } from '../Impl/product';
import { getStoreId } from '../Impl/store';
import { ProductResult } from '../Impl/type';
import { createExpiredTimeToISOString } from '../Impl/utils';
import { getVariant } from '../Impl/variant';
import { DATA_BASE } from '../database';
import { assert } from '@/lib/utils';
import {
  updateSubscription as updateSubscriptionAPI,
  pauseSubscription as pauseSubscriptionAPI,
  unPauseSubscription as unPauseSubscriptionAPI,
  getSubscriptionInfo as getSubscriptionInfoAPI
} from '../Impl/subscription';


export enum Plan {
  Base = 'Base',
  Plus = 'Plus',
}


// TODO 返回数据后转化
async function get(userId:string): Promise<any | null> {
  assert(userId, '缺少用户ID');
  const subscriptionId = await DATA_BASE.get(userId);
  if(subscriptionId){
    return getSubscriptionInfoAPI(subscriptionId)
  }
  return null;
}

async function findProductByPlanName(planName: Plan): Promise<ProductResult['data']> {
  const productList = await getProduct();
  const product = productList.data.find(item => item.attributes.name === planName);
  if (!product) {
    throw new Error(`无法找到指定商品: ${planName}`);
  }
  return product;
}

async function subscribe(
  planName: Plan,
  payload: {
    email?: string;
    custom: {
      id: string;
    };
  }
): Promise<any> {
  // 具体判断逻辑交给 Lemon Squeezy
  const [store_id, product] = await Promise.all([getStoreId(), findProductByPlanName(planName)]);
  const variant = (await getVariant(product.id))![0];
  const checkout = await createCheckout(variant.id, store_id, {
    checkout_data: {
      custom: payload.custom,
      email: payload.email,
    },
    expires_at: createExpiredTimeToISOString(1000 * 60 * 10),
  });

  return checkout.data.attributes.url;
}

async function update(planName: Plan, payload: { userId: string }): Promise<string> {
  assert(payload.userId, '缺少用户ID');
  const subscriptionId = await DATA_BASE.get(payload.userId);
  assert(subscriptionId, '当前用户没有订阅');
  const product = await findProductByPlanName(planName);
  const variant = (await getVariant(product.id))![0];
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
  const subscriptionId = await DATA_BASE.get(userId);
  assert(subscriptionId, '当前用户没有订阅');
  await pauseSubscriptionAPI(subscriptionId);
}

async function unPause(userId: string): Promise<void> {
  assert(userId, '缺少用户ID');
  const subscriptionId = await DATA_BASE.get(userId);
  assert(subscriptionId, '当前用户没有订阅');
  await unPauseSubscriptionAPI(subscriptionId);
}



export const getSubscriptionInfo = allowMethod('GET',
withSessionApiRoute(async (req, res) => {
  const session = req.session.content!;

  const data = await get(session.userId)

  res.json(
    createSuccessResponse(data || {})
  );
}) 
)

export const createSubscription = allowMethod(
  'POST',
  withSessionApiRoute(async (req, res) => {
    const body = req.body;
    const session = req.session.content!;

    const payUrl = await subscribe(body.name, {
      email: session.accountNo,
      custom: {
        id: session.userId,
      },
    });

    res.json(
      createSuccessResponse({
        payUrl,
      })
    );
  })
);

export const updateSubscription = allowMethod(
  'POST',
  withSessionApiRoute(async (req, res) => {
    const body = req.body;
    const session = req.session.content!;

    const payUrl = await update(body.name, {
      userId: session.userId,
    });

    res.json(
      createSuccessResponse({
        payUrl,
      })
    );
  })
);

export const pauseSubscription = allowMethod(
  'POST',
  withSessionApiRoute(async (req, res) => {
    const session = req.session.content!;

    await pause(session.userId);

    res.json(createSuccessResponse({}));
  })
);


export const unpauseSubscription = allowMethod(
  'POST',
  withSessionApiRoute(async (req, res) => {
    const session = req.session.content!;

    await unPause(session.userId);

    res.json(createSuccessResponse({}));
  })
);
