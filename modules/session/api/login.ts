import { getRequestURL, parseResponse, parseSetCookie } from '@/modules/backend-node';

import { VDSessionCore } from '../types';
import { allowMethod } from '@/lib/api';
import { withSessionApiRoute } from '../api-helper';

/**
 * 登录
 * @param req
 * @param res
 */
export const login = allowMethod(
  'POST',
  withSessionApiRoute(async (req, res) => {
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
  })
);
