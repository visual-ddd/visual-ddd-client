import { allowMethod } from '@/lib/api';
import { createSuccessResponse } from '@/modules/backend-node';
import { withIronSessionApiRoute } from 'iron-session/next';

import { IRON_SESSION_OPTIONS } from '../config';
import { VDSessionState } from '../types';

/**
 * 更新会话状态
 */
export const updateSessionState = allowMethod(
  'POST',
  withIronSessionApiRoute(async (req, res) => {
    const state = req.body as VDSessionState;

    req.session.content!.state = state;

    await req.session.save();

    res.status(200).json(createSuccessResponse(null));
  }, IRON_SESSION_OPTIONS)
);
