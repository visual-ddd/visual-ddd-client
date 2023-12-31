import dynamic from 'next/dynamic';
import Head from 'next/head';
import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import { DomainDetailPayload, DomainVersion, VersionStatus } from '@/modules/team/types';
import type { DomainDescription } from '@/modules/domain/Designer';
import { getSession } from '@/modules/session/api';
import { addCacheWithRaw } from '@/modules/domain/api';
import { useGlobalUbiquitousLanguage } from '@/modules/team/UbiquitousLanguage/useGlobalUbiquitousLanguage';
import { useRouter } from 'next/router';

const DynamicDesigner = dynamic(() => import('@/modules/domain/Designer'), { ssr: false });

export interface DesignerProps {
  id: string;
  readonly: boolean;
  description: DomainDescription;
}

/**
 * 设计器
 * @returns
 */
export default function Designer(props: DesignerProps) {
  const router = useRouter();
  const { id, readonly, description } = props;
  const { words, list } = useGlobalUbiquitousLanguage();

  const handleGotoParent = () => {
    const { id, did, rid } = router.query as { id: string; did: string; rid: string };

    router.push(`/team/${id}/domain/${did}/reversion/${rid}`);
  };

  return (
    <>
      <Head>
        <title>{`${description.name} - 业务域设计器`}</title>
      </Head>
      <DynamicDesigner
        onGotoParent={handleGotoParent}
        id={id}
        readonly={readonly}
        description={description}
        words={words}
        ubiquitousLanguages={list}
      />
    </>
  );
}

export const getServerSideProps = withWakedataRequestSsr<DesignerProps>(async context => {
  const { did, rid, action } = context.params as { did: string; rid: string; action: 'edit' | 'view' };

  if (action !== 'edit' && action !== 'view') {
    return {
      notFound: true,
    };
  }

  // 获取业务域详情
  const [session, detail, version] = await Promise.all([
    getSession(context.req),
    context.req.request<DomainDetailPayload>(
      '/wd/visual/web/domain-design/domain-design-detail-query',
      {
        id: did,
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

  if (version.graphDsl) {
    addCacheWithRaw(rid, version.graphDsl);
  }

  return {
    props: {
      id: rid,
      readonly: action === 'view' || version.state === VersionStatus.PUBLISHED,
      description: {
        id: did,
        name: detail.name,
        versionId: rid,
        version: version.currentVersion,
        versionStatus: version.state,
        user: {
          id: session.user.accountNo,
          name: session.user.userName,
          avatar: session.user.icon,
        },
      },
    },
  };
});
