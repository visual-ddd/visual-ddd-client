import { withWakedataRequestSsr } from '@/modules/session/server';
import { Launch, LaunchProps, LaunchInfo } from '@/modules/user/Launch';

/**
 * 启动页
 */
export default Launch;

export const getServerSideProps = withWakedataRequestSsr<LaunchProps>(async context => {
  const data = await context.req.request<LaunchInfo>(
    '/wd/visual/web/account/login/get-account-role',
    {},
    { method: 'POST' }
  );
  return { props: { data } };
});
