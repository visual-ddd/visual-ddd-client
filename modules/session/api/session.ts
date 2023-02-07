import { allowMethod } from '@/lib/api';
import { createSuccessResponse } from '@/modules/backend-node';
import { withIronSessionApiRoute } from 'iron-session/next';

import { IRON_SESSION_OPTIONS } from '../config';

/**
 * 获取会话状态
 */
export const session = allowMethod(
  'GET',
  withIronSessionApiRoute(async (req, res) => {
    const sessionCore = req.session.content;

    // TODO: 获取会话信息

    res.status(200).json(createSuccessResponse(sessionCore));
  }, IRON_SESSION_OPTIONS)
);
