import { allowMethod } from '@/lib/api';
import { createFailResponse, createSuccessResponse } from '@/modules/backend-node';
import { withWakedataRequestApiRoute } from '@/modules/session/api-helper';
import { parseInviteCode } from './invite-code';

function getCodeInReferer(referer?: string) {
  if (referer) {
    const url = new URL(referer);
    return url.searchParams.get('i');
  }
}

/**
 * 注册接口
 */
export const register = allowMethod(
  'POST',
  withWakedataRequestApiRoute(async (req, res) => {
    const referer = req.headers.referer;
    const code = getCodeInReferer(referer);
    const requiredInvitation = process.env.REQUIRE_INVITATION === 'true';

    if (requiredInvitation && !code) {
      res.json(createFailResponse(400, '目前仅支持邀请注册'));
      return;
    }

    const dataPassthrough: Record<string, any> = {};

    if (code) {
      try {
        const data = await parseInviteCode(code);
        dataPassthrough.inviteAccountNo = data;
      } catch (err) {
        console.error(err);
        if (requiredInvitation) {
          res.json(createFailResponse(400, '目前仅支持邀请注册'));
          return;
        }
      }
    }

    await req.request(
      '/wd/visual/web/account/account-register',
      { ...req.body, ...dataPassthrough },
      { method: 'POST' }
    );
    res.json(createSuccessResponse(null));
  })
);
