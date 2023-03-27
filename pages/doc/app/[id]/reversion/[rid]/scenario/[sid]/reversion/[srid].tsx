import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import { AppInfo, ScenarioDoc, ScenarioDocProps } from '@/modules/team/App/Doc';
import { ScenarioSimple, ScenarioVersion } from '@/modules/team/types';

/**
 * 业务场景文档
 * @returns
 */
export default function Page(props: ScenarioDocProps) {
  return <ScenarioDoc {...props}></ScenarioDoc>;
}

export const getServerSideProps = withWakedataRequestSsr<ScenarioDocProps>(async context => {
  const { rid, srid } = context.params as { id: string; srid: string; rid: string };

  const appInfo = await context.req.request<AppInfo>(
    '/wd/visual/web/secondary-development/get-application-bind-model-info',
    { id: rid }
  );
  interface Payload extends ScenarioVersion {
    businessSceneDTO: ScenarioSimple;
  }

  const { businessSceneDTO, ...version } = await context.req.request<Payload>(
    '/wd/visual/web/secondary-development/get-business-scene-version-no-auth',
    { id: srid }
  );

  return {
    props: { info: appInfo, detail: { version, ...businessSceneDTO } },
  };
});
