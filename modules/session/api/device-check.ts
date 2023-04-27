/**
 * 设备检查
 */
import { allowMethod } from '@/lib/api';
import { createFailResponse, createSuccessResponse } from '@/modules/backend-node';
import { withIronSessionApiRoute } from 'iron-session/next';
import { IncomingMessage } from 'http';
import { NextApiRequest } from 'next';

import { IRON_SESSION_OPTIONS } from '../config';
import { getState, isExceed, removeState, updateState } from './ip-state';

function getIp(req: IncomingMessage) {
  return (req.headers['x-forwarded-for'] as string | undefined) || req.socket.remoteAddress;
}

/**
 * 移除 ip
 * @param req
 */
export function removeStateByRequest(req: NextApiRequest) {
  const accountNo = req.session.content?.accountNo;
  const ip = getIp(req);

  if (accountNo && ip) {
    removeState(accountNo, ip);
  }
}

/**
 * 多设备限制
 */
export const deviceCheck = allowMethod(
  'POST',
  withIronSessionApiRoute(async (req, res) => {
    const accountNo = req.session.content?.accountNo;

    const ip = getIp(req);

    if (accountNo && ip) {
      updateState(accountNo, ip);

      if (isExceed(accountNo)) {
        console.log(`检测到多设备登录: ${accountNo} ${ip}, ${JSON.stringify(getState(accountNo))}`);
        res.status(200).json(createFailResponse(403, '检测到多设备登录'));
        return;
      }
    }

    res.status(200).json(createSuccessResponse(null));
  }, IRON_SESSION_OPTIONS)
);
