import { normalizeUrl, toUrl } from '@/lib/utils';
import type { TeamDetail } from '@/modules/organization/types';
import { withWakedataRequestSsr } from '@/modules/session/server';
import {
  Launch,
  LaunchProps,
  LaunchInfo,
  verifyRedirect,
  normalizeLaunchInfo,
  isEntry,
  isLaunch,
} from '@/modules/user/Launch';

/**
 * 启动页
 */
export default Launch;

export const getServerSideProps = withWakedataRequestSsr<LaunchProps>(async context => {
  context.res.setHeader('Cache-Control', 'no-cache');

  const from = context.query.from as string | undefined;

  const data = await context.req.request<LaunchInfo>(
    '/wd/visual/web/account/login/get-account-role',
    {},
    { method: 'POST' }
  );

  // 过滤掉非管理员的组织
  normalizeLaunchInfo(data);
  const defaultResponse = {
    props: { data },
  };

  if (from) {
    const fromUrl = toUrl(from);

    // 无效 url
    if (fromUrl == null) {
      return defaultResponse;
    }

    // 启动页
    if (isLaunch(fromUrl.pathname)) {
      return defaultResponse;
    }

    // 非入口文件，可以直接跳转打开
    if (!isEntry(fromUrl.pathname) && !fromUrl.pathname.startsWith('/_')) {
      return {
        redirect: { destination: normalizeUrl(from)!, permanent: false },
      };
    }

    const getTeamInfo = async (teamId: string | number) => {
      return context.req.request<TeamDetail>(
        '/wd/visual/web/team/team-detail-query',
        { id: teamId },
        { method: 'GET' }
      );
    };

    // 验证权限
    const shouldRedirect = await verifyRedirect(from, data, getTeamInfo);

    if (shouldRedirect) {
      context.req.session.content!.state = shouldRedirect;

      await context.req.session.save();

      return {
        redirect: { destination: normalizeUrl(from)!, permanent: false },
      };
    }
  }

  return defaultResponse;
});
