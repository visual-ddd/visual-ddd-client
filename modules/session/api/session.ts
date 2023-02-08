import { allowMethod } from '@/lib/api';
import { createSuccessResponse } from '@/modules/backend-node';
import { withWakedataRequest } from '../api-helper';

/**
 * 获取会话状态
 */
export const session = allowMethod(
  'GET',
  withWakedataRequest(async (req, res) => {
    // @ts-expect-error
    const sessionCore = req.session.content;

    // TODO: 获取会话信息
    const result = await req.request('/wd/visual/web/account/account-page-query', {}, { method: 'GET' });

    res.status(200).json(createSuccessResponse(result));
  })
);
