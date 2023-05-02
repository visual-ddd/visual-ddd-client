import { allowMethod } from '@/lib/api';

import { getFreeAccountRateLimit } from '../rate-limit';
import { withSessionApiRoute } from '@/modules/session/api-helper';
import { createSuccessResponse } from '@/modules/backend-node';

/**
 * 获取免费使用额度
 */
export const freeUsage = allowMethod(
  'GET',
  withSessionApiRoute(async (req, res) => {
    const account = req.session.content!.accountNo;
    const freeAccountRateLimit = getFreeAccountRateLimit();

    const usage = await freeAccountRateLimit.remainUsage(account);

    res.json(
      createSuccessResponse({
        remain: usage.count,
        total: freeAccountRateLimit.limits().count,
      })
    );
  })
);
