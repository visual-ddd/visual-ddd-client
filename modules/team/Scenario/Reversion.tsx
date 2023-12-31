import { useRouter } from 'next/router';
import {
  useVersionListRef,
  VersionCreate,
  useVersionCreateRef,
  VersionList,
  VersionListProps,
  VersionCreateProps,
  VersionPublish,
  useVersionPublishRef,
  VersionPublishProps,
} from '@/lib/components/VersionControl';
import { PreviewPageLayout, PreviewPageSection, PreviewPageVersion } from '@/lib/components/PreviewPageLayout';
import { Button, Card, Space, Statistic } from 'antd';
import classNames from 'classnames';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { request, useRequestPaginationByGet } from '@/modules/backend-client';
import { useLayoutTitle } from '@/modules/Layout';
import type { ScenarioDSL } from '@/modules/scenario/api/dsl/interface';

import { ScenarioDetail, VersionStatus } from '../types';
import { UpdateScenario, useUpdateScenario } from './Update';
import Graph from './Graph';
import { useStat } from './useStat';
import s from './Reversion.module.scss';

export interface ScenarioReversionProps {
  detail: ScenarioDetail;
}

const ScenarioStandalone = dynamic(() => import('@/modules/scenario/scenario-design/StandaloneEditor'), {
  ssr: false,
});

export const ScenarioReversion = (props: ScenarioReversionProps) => {
  const { detail } = props;
  const router = useRouter();
  useLayoutTitle(`${detail.name}`);

  const updateRef = useUpdateScenario();
  const versionListRef = useVersionListRef();
  const versionCreateRef = useVersionCreateRef();
  const versionPublishRef = useVersionPublishRef();
  const status = detail.version.state;
  const KEY = detail.id + '_' + detail.version.id;

  const dslStr = detail.version.dsl;
  const dsl = useMemo<ScenarioDSL | undefined>(() => {
    if (dslStr) {
      return JSON.parse(dslStr);
    }
  }, [dslStr]);
  const stats = useStat(dsl);
  const { data: versionList } = useRequestPaginationByGet(
    `/wd/visual/web/business-scene-version/business-scene-version-page-query?pageNo=1&pageSize=1&searchCount=true&businessSceneId=${detail.id}`
  );

  const requestVersionList: VersionListProps['onRequest'] = async ({ pageNo, pageSize }) => {
    const { totalCount, data } = await request.requestPaginationByGet(
      '/wd/visual/web/business-scene-version/business-scene-version-page-query',
      {
        pageNo,
        pageSize,
        searchCount: true,
        businessSceneId: detail.id,
      }
    );

    return { data, total: totalCount };
  };

  const navigateToVersion = (id: number) => {
    router.push(`/team/${detail.teamId}/scenario/${detail.id}/reversion/${id}`);
  };

  const navigateToAction = (id: number, action: 'view' | 'edit') => {
    const name = `scenario-${detail.id}-reversion-${id}`;
    window.open(`/team/${detail.teamId}/scenario/${detail.id}/reversion/${id}/${action}`, name);
  };

  const handleCreateVersion: VersionCreateProps['onSubmit'] = async values => {
    const id = await request.requestByPost<number>(
      '/wd/visual/web/business-scene-version/business-scene-version-create',
      {
        ...values,
        businessSceneId: detail.id,
      }
    );

    versionListRef.current?.hide();

    // 跳转到新版本
    navigateToVersion(id);
  };

  const handlePublish: VersionPublishProps['onSubmit'] = async values => {
    const { id, description } = values;

    await request.requestByPost('/wd/visual/web/business-scene-version/business-scene-version-pblish', {
      id,
      description,
    });
    versionListRef.current?.hide();

    // 刷新当前页面
    router.replace(router.asPath);
  };

  const handleOpenPublish = () => {
    versionPublishRef.current?.open(detail.version);
  };

  const handleOpenVersionList = () => {
    versionListRef.current?.open();
  };

  return (
    <PreviewPageLayout
      className={classNames('vd-domain-rv')}
      meta={
        <Space>
          <PreviewPageVersion
            version={detail.version.currentVersion}
            status={detail.version.state}
          ></PreviewPageVersion>
          <Button
            size="small"
            onClick={() => {
              versionCreateRef.current?.open(detail.version);
            }}
          >
            Fork 版本
          </Button>
          <Button size="small" onClick={handleOpenVersionList}>
            查看历史版本
          </Button>
          {status === VersionStatus.UNPUBLISHED && (
            <Button size="small" onClick={handleOpenPublish}>
              发布
            </Button>
          )}
        </Space>
      }
      stats={
        <>
          <Card bordered size="small">
            <Statistic value={stats?.services ?? 0} title="能力"></Statistic>
          </Card>

          {/* <Card bordered size="small">
            <Statistic value={6} title="关联应用"></Statistic>
          </Card> */}
          <Card bordered size="small">
            <Statistic value={stats?.domain ?? 0} title="关联业务域"></Statistic>
          </Card>
          <Card className="u-pointer" bordered size="small" onClick={handleOpenVersionList}>
            <Statistic value={versionList?.totalCount ?? 0} title="版本"></Statistic>
          </Card>
        </>
      }
      left={
        <>
          <Card size="small" title="简介">
            <PreviewPageSection name="描述">{detail.description || '未配置描述'}</PreviewPageSection>
            <PreviewPageSection name={`版本描述(${detail.version.currentVersion})`}>
              {detail.version.description || '未配置版本描述'}
            </PreviewPageSection>
          </Card>
          <Card size="small" title="概览图">
            <Graph key={KEY} detail={detail} dsl={dsl} />
          </Card>
        </>
      }
      right={
        <>
          <Card size="small" title="操作">
            <Space>
              <Button size="small" type="primary" onClick={() => updateRef.current?.open()}>
                设置
              </Button>
              <Button
                size="small"
                type="primary"
                onClick={() => {
                  navigateToAction(detail.version.id, 'view');
                }}
              >
                预览
              </Button>
              {status !== VersionStatus.PUBLISHED && (
                <Button
                  size="small"
                  type="primary"
                  onClick={() => {
                    navigateToAction(detail.version.id, 'edit');
                  }}
                >
                  开始设计
                </Button>
              )}
            </Space>
          </Card>
          <Card size="small" title="流程图">
            <ScenarioStandalone className={s.flowGraph} key={KEY} dsl={detail.version.graphDsl} />
          </Card>
        </>
      }
    >
      <UpdateScenario ref={updateRef} detail={detail} />
      <VersionList
        onRequest={requestVersionList}
        ref={versionListRef}
        onFork={v => {
          versionCreateRef.current?.open(v);
        }}
        onNavigate={v => {
          navigateToVersion(v.id);
        }}
        onEdit={v => {
          navigateToAction(v.id, 'edit');
        }}
        onPreview={v => {
          navigateToAction(v.id, 'view');
        }}
      />
      <VersionCreate ref={versionCreateRef} onSubmit={handleCreateVersion} />
      <VersionPublish ref={versionPublishRef} onSubmit={handlePublish} />
    </PreviewPageLayout>
  );
};

export default ScenarioReversion;
