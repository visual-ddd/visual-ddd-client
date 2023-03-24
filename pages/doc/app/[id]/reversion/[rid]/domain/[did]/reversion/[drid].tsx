import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import { AppInfo, DomainDoc } from '@/modules/team/App/Doc';
import { DomainDetail, DomainSimple, DomainVersion } from '@/modules/team/types';

interface Props {
  appInfo: AppInfo;
  domain: DomainDetail;
}

/**
 * 业务域文档
 * @returns
 */
export default function Page(props: Props) {
  return <DomainDoc domain={props.domain} info={props.appInfo}></DomainDoc>;
}

export const getServerSideProps = withWakedataRequestSsr<Props>(async context => {
  const { drid, rid } = context.params as { id: string; drid: string; rid: string };

  interface Payload extends DomainVersion {
    domainDesignDTO: DomainSimple;
  }

  const appInfo = await context.req.request<AppInfo>(
    '/wd/visual/web/secondary-development/get-application-bind-model-info',
    { id: rid }
  );

  const { domainDesignDTO, ...version } = await context.req.request<Payload>(
    '/wd/visual/web/secondary-development/get-domain-design-version-no-auth',
    { id: drid }
  );

  const domain = { version, ...domainDesignDTO };

  return {
    props: { domain, appInfo },
  };
});
