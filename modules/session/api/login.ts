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

        // 保存 cookie，将透传给客户端
        // 通常这个信息不回透传给客户端，但是后端的流量不一定通过 当前 server 中转，
        // 因此这里选择了这种方式
        res.setHeader(
          'set-cookie',
          sessionCookie.split(',').map(i => i.trim())
        );

        // 保存 session
        // save 会自动合并 set-cookie
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
