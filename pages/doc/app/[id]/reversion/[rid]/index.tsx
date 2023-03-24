import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import { AppInfo, Doc } from '@/modules/team/App/Doc';

interface Props {
  appInfo: AppInfo;
}

/**
 * 应用版本文档首页
 * @returns
 */
export default function AppDoc(props: Props) {
  return <Doc info={props.appInfo}>hello</Doc>;
}

export const getServerSideProps = withWakedataRequestSsr<Props>(async context => {
  const { rid } = context.params as { id: string; rid: string };

  const appInfo = await context.req.request<AppInfo>(
    '/wd/visual/web/secondary-development/get-application-bind-model-info',
    { id: rid }
  );

  return {
    props: { appInfo },
  };
});
