import { normalizeUrl } from '@/lib/utils';
import { withWakedataRequestSsr } from '@/modules/session/server';
import { Launch, LaunchProps, LaunchInfo, verifyRedirect } from '@/modules/user/Launch';

/**
 * 启动页
 */
export default Launch;

export const getServerSideProps = withWakedataRequestSsr<LaunchProps>(async context => {
  const from = context.query.from as string | undefined;

  const data = await context.req.request<LaunchInfo>(
    '/wd/visual/web/account/login/get-account-role',
    {},
    { method: 'POST' }
  );

  // 过滤掉非管理员的组织
  data.accountOrganizationInfoList = data.accountOrganizationInfoList?.filter(i => i.isOrganizationAdmin);

  if (from) {
    const shouldRedirect = verifyRedirect(from, data);

    if (shouldRedirect) {
      context.req.session.content!.state = shouldRedirect;

      await context.req.session.save();

      return {
        redirect: { destination: normalizeUrl(from)!, statusCode: 302 },
      };
    }
  }

  return { props: { data } };
});
