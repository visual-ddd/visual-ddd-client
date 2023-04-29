import { allowMethod } from '@/lib/api';
import * as t from './invite-code';
import { withWakedataRequestApiRoute } from '@/modules/session/api-helper';
import { createSuccessResponse } from '@/modules/backend-node';

/**
 * 创建邀请链接
 */
export const createInviteCode = allowMethod(
  'GET',
  withWakedataRequestApiRoute(async (req, res) => {
    const session = req.session.content!;

    const data: t.InviteInfo = {
      type: 'user',
      id: session.accountNo,
      date: Date.now(),
    };

    const code = await t.createInviteCode(data);

    res.json(createSuccessResponse(code));
  })
);
