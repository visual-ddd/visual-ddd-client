import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import { AppInfo, ScenarioDoc } from '@/modules/team/App/Doc';

interface Props {
  appInfo: AppInfo;
}

/**
 * 业务场景文档
 * @returns
 */
export default function Page(props: Props) {
  return <ScenarioDoc info={props.appInfo}></ScenarioDoc>;
}

export const getServerSideProps = withWakedataRequestSsr<Props>(async context => {
  const { rid } = context.params as { id: string; srid: string; rid: string };

  const appInfo = await context.req.request<AppInfo>(
    '/wd/visual/web/secondary-development/get-application-bind-model-info',
    { id: rid }
  );

  return {
    props: { appInfo },
  };
});
