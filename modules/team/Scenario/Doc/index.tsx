import { VersionBadge } from '@/lib/components/VersionBadge';
import { useYDocFromBase64 } from '@/lib/yjs-store-api-for-browser';
import type { ScenarioDSL } from '@/modules/scenario/api/dsl/interface';
import { useSession } from '@/modules/session';
import { Button } from 'antd';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useMemo } from 'react';
import { ScenarioDetail } from '../../types';
import { ApiDoc } from './ApiDoc';

export interface DocProps {
  detail: ScenarioDetail;
}

const ScenarioStandalone = dynamic(() => import('@/modules/scenario/scenario-design/StandaloneEditor'), {
  ssr: false,
});

export const Doc = (props: DocProps) => {
  const { detail } = props;
  const yjsDoc = useYDocFromBase64(detail.version.graphDsl, true);

  const session = useSession({ shouldRedirect: false });

  const dsl = useMemo<ScenarioDSL | undefined>(() => {
    return detail.version.dsl ? JSON.parse(detail.version.dsl) : undefined;
  }, [detail.version.dsl]);

  return (
    <div>
      <Head>
        <title>{`${detail.name} - 业务场景 `}</title>
      </Head>
      <h1 id="title">{detail.name}</h1>
      <section>
        <dl>
          <dt>标识符：</dt>
          <dd>{detail.identity}</dd>
          <dt>版本：</dt>
          <dd>
            <VersionBadge version={detail.version.currentVersion} status={detail.version.state} type="text" />
          </dd>
          <dt>最后更新于：</dt>
          <dd>{detail.version.updateTime}</dd>
        </dl>
        <blockquote>
          <p>
            <b>业务场景说明</b>
            <br />
            {detail.description || '业务场景描述'}
          </p>
          <p>
            <b>版本说明</b>
            <br />
            {detail.version.description || '版本描述'}
          </p>
          {!!session.session && (
            <p>
              <Button
                onClick={() => {
                  window.open(
                    `/launch?from=${encodeURIComponent(
                      `/team/${detail.teamId}/scenario/${detail.id}/reversion/${detail.version.id}`
                    )}`,
                    'main'
                  );
                }}
              >
                进入主页
              </Button>
            </p>
          )}
        </blockquote>
      </section>
      <section>
        <h2>业务流程</h2>
        <ScenarioStandalone dsl={yjsDoc} />
      </section>

      <section>
        <h2>接口文档</h2>
        {!!dsl && <ApiDoc dsl={dsl} />}
      </section>
    </div>
  );
};
