import dynamic from 'next/dynamic';
import Head from 'next/head';
import { withWakedataRequestSsr } from '@/modules/session/ssr-helper';
import { ScenarioDetailPayload, ScenarioVersion, VersionStatus } from '@/modules/team/types';
import type { ScenarioDescription } from '@/modules/scenario/Designer';
import { getSession } from '@/modules/session/api';
import { addCacheWithBase64IfNeed } from '@/modules/scenario/api';

const DynamicDesigner = dynamic(() => import('@/modules/scenario/Designer'), { ssr: false });

export interface DesignerProps {
  id: string;
  readonly: boolean;
  description: ScenarioDescription;
}

/**
 * 设计器
 * @returns
 */
export default function Designer(props: DesignerProps) {
  const { id, readonly, description } = props;

  return (
    <>
      <Head>
        <title>{`${description.name} - 业务场景设计器`}</title>
      </Head>
      <DynamicDesigner id={id} readonly={readonly} description={description} />
    </>
  );
}

export const getServerSideProps = withWakedataRequestSsr<DesignerProps>(async context => {
  const { sid, rid, action } = context.params as { sid: string; rid: string; action: 'edit' | 'view' };

  if (action !== 'edit' && action !== 'view') {
    return {
      notFound: true,
    };
  }

  // 获取业务场景详情
  const [session, detail, version] = await Promise.all([
    getSession(context.req),
    context.req.request<ScenarioDetailPayload>(
      '/wd/visual/web/business-scene/business-scene-detail-query',
      {
        id: sid,
      },
      { method: 'GET' }
    ),
    context.req.request<ScenarioVersion>(
      '/wd/visual/web/business-scene-version/business-scene-version-detail-query',
      {
        id: rid,
      },
      { method: 'GET' }
    ),
  ]);

  if (version.graphDsl) {
    addCacheWithBase64IfNeed(rid, version.graphDsl);
  }

  return {
    props: {
      id: rid,
      readonly: action === 'view' || version.state === VersionStatus.PUBLISHED,
      description: {
        id: sid,
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
