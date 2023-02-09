import { allowMethod } from '@/lib/api';
import { createSuccessResponse } from '@/modules/backend-node';
import { withIronSessionApiRoute } from 'iron-session/next';

import { IRON_SESSION_OPTIONS } from '../config';

/**
 * 退出登录
 */
export const logout = allowMethod(
  'POST',
  withIronSessionApiRoute(async (req, res) => {
    req.session.destroy();
    res.status(200).json(createSuccessResponse(null));
  }, IRON_SESSION_OPTIONS)
);
