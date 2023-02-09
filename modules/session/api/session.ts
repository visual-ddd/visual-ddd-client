import { allowMethod } from '@/lib/api';
import { createSuccessResponse } from '@/modules/backend-node';
import { withWakedataRequestApiRoute } from '../api-helper';
import { VDSessionDetail, VDUser } from '../types';
import { getGravatarUrl } from './utils';

/**
 * 获取会话状态
 */
export const session = allowMethod(
  'GET',
  withWakedataRequestApiRoute(async (req, res) => {
    const sessionCore = req.session.content!;

    // 获取会话信息
    const user = await req.request<VDUser>('/wd/visual/web/account/login/get-account-info', {});

    if (!user.icon) {
      user.icon = getGravatarUrl(user.accountNo);
    }

    const result: VDSessionDetail = {
      ...sessionCore,
      user,
    };

    res.status(200).json(createSuccessResponse(result));
  })
);
