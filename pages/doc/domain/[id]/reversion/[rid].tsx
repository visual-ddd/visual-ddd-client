import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import type { DomainDetail, DomainSimple, DomainVersion } from '@/modules/team/types';
import { getDocumentLayout } from '@/modules/document-layout';
import { Doc } from '@/modules/team/Domain/Doc';

/**
 * 业务域具体版本首页
 * @returns
 */
export default function DomainDoc(props: { detail: DomainDetail }) {
  return <Doc {...props} />;
}

DomainDoc.getLayout = getDocumentLayout;

export const getServerSideProps = withWakedataRequestSsr<{ detail: DomainDetail }>(async context => {
  const { rid } = context.params as { id: string; rid: string };

  interface Payload extends DomainVersion {
    domainDesignDTO: DomainSimple;
  }

  const { domainDesignDTO, ...version } = await context.req.request<Payload>(
    '/wd/visual/web/secondary-development/get-domain-design-version-no-auth',
    { id: rid }
  );

  return {
    props: { detail: { version, ...domainDesignDTO } },
  };
});
