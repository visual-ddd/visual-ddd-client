import { withIronSessionApiRoute } from 'iron-session/next';
import { getRequestURL, parseResponse, parseSetCookie } from '@/modules/backend-node';

import { IRON_SESSION_OPTIONS } from '../config';
import { VDSessionCore } from '../types';

/**
 * 登录
 * @param req
 * @param res
 */
export const login = withIronSessionApiRoute(async (req, res) => {
  const loginPayload = req.body as {
    accountNo: string;
  };

  const response = await fetch(getRequestURL('/wd/visual/web/account/login/login'), {
    body: JSON.stringify(loginPayload),
    method: 'POST',
    headers: { 'content-type': 'application/json' },
  });

  const result = await response.json();

  try {
    // 成功登录
    parseResponse(result);
    const sessionCookie = response.headers.get('set-cookie');

    if (sessionCookie) {
      const list = parseSetCookie(sessionCookie);
      // 保存 session
      req.session.content = {
        cookies: list,
        accountNo: loginPayload.accountNo,
      } satisfies VDSessionCore;
      await req.session.save();
    }
  } catch (err) {
    // ignore
  }

  res.status(200).json(result);
}, IRON_SESSION_OPTIONS);
