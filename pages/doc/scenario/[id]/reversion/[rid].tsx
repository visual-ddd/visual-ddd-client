import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import type { ScenarioSimple, ScenarioVersion } from '@/modules/team/types';
import { getDocumentLayout } from '@/modules/document-layout';
import { DocProps, Doc } from '@/modules/team/Scenario/Doc';

/**
 * 业务场景具体版本首页
 * @returns
 */
export default function DomainDoc(props: DocProps) {
  return <Doc {...props} />;
}

DomainDoc.getLayout = getDocumentLayout;

export const getServerSideProps = withWakedataRequestSsr<DocProps>(async context => {
  const { rid } = context.params as { id: string; rid: string };

  interface Payload extends ScenarioVersion {
    businessSceneDTO: ScenarioSimple;
  }

  const { businessSceneDTO, ...version } = await context.req.request<Payload>(
    '/wd/visual/web/secondary-development/get-business-scene-version-no-auth',
    { id: rid }
  );

  return {
    props: { detail: { version, ...businessSceneDTO } },
  };
});
