import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import type { DomainDetail, DomainDetailPayload, DomainVersion } from '@/modules/team/types';
import { getDocumentLayout } from '@/modules/document-layout';
import { Doc } from '@/modules/team/Domain/Doc';
import omit from 'lodash/omit';

/**
 * 业务域具体版本首页
 * @returns
 */
export default function DomainDoc(props: { detail: DomainDetail }) {
  return <Doc {...props} />;
}

DomainDoc.getLayout = getDocumentLayout;

export const getServerSideProps = withWakedataRequestSsr<{ detail: DomainDetail }>(async context => {
  const { id, rid } = context.params as { id: string; rid: string };

  // 获取业务域详情
  const [detail, version] = await Promise.all([
    context.req.request<DomainDetailPayload>(
      '/wd/visual/web/domain-design/domain-design-detail-query',
      {
        id,
      },
      { method: 'GET' }
    ),
    context.req.request<DomainVersion>(
      '/wd/visual/web/domain-design-version/domain-design-version-detail-query',
      {
        id: rid,
      },
      { method: 'GET' }
    ),
  ]);

  return {
    props: { detail: { version, ...omit(detail, 'domainDesignLatestVersion') } },
  };
});
