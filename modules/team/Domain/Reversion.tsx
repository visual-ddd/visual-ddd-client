import { useMemo } from 'react';
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
import type { BusinessDomainDSL } from '@/modules/domain/api/dsl/interface';
import { PreviewPageLayout, PreviewPageSection, PreviewPageVersion } from '@/lib/components/PreviewPageLayout';
import { Button, Card, Space, Statistic } from 'antd';
import classNames from 'classnames';
import { request, useRequestPaginationByGet } from '@/modules/backend-client';

import { useLayoutTitle } from '@/modules/Layout';
import { DomainDetail, VersionStatus } from '../types';
import { UpdateDomain, useUpdateDomain } from './Update';
import { Graph } from './Graph';
import { useStat } from './useStat';

export interface DomainReversionProps {
  detail: DomainDetail;
}

export const DomainReversion = (props: DomainReversionProps) => {
  const { detail } = props;
  const router = useRouter();
  useLayoutTitle(`${detail.name}`);
  const updateRef = useUpdateDomain();
  const versionListRef = useVersionListRef();
  const versionCreateRef = useVersionCreateRef();
  const versionPublishRef = useVersionPublishRef();
  const status = detail.version.state;
  const dslStr = detail.version.domainDesignDsl;
  const dsl = useMemo<BusinessDomainDSL | undefined>(() => {
    if (dslStr) {
      return JSON.parse(dslStr);
    }
  }, [dslStr]);
  const stats = useStat(dsl);
  const { data: versionList } = useRequestPaginationByGet(
    `/wd/visual/web/domain-design-version/domain-design-version-page-query?pageNo=1&pageSize=1&searchCount=true&domainDesignId=${detail.id}`
  );

  const requestVersionList: VersionListProps['onRequest'] = async ({ pageNo, pageSize }) => {
    const { totalCount, data } = await request.requestPaginationByGet(
      '/wd/visual/web/domain-design-version/domain-design-version-page-query',
      {
        pageNo,
        pageSize,
        searchCount: true,
        domainDesignId: detail.id,
      }
    );

    return { data, total: totalCount };
  };

  const navigateToVersion = (id: number) => {
    router.push(`/team/${detail.teamId}/domain/${detail.id}/reversion/${id}`);
  };

  const navigateToAction = (id: number, action: 'view' | 'edit') => {
    const name = `domain-${detail.id}-reversion-${id}`;
    window.open(`/team/${detail.teamId}/domain/${detail.id}/reversion/${id}/${action}`, name);
  };

  const navigateToDoc = () => {
    const name = `domain-${detail.id}-reversion-${detail.version.id}-doc`;
    window.open(`/doc/domain/${detail.id}/reversion/${detail.version.id}`, name);
  };

  const handleCreateVersion: VersionCreateProps['onSubmit'] = async values => {
    const id = await request.requestByPost<number>(
      '/wd/visual/web/domain-design-version/domain-design-version-create',
      {
        ...values,
        domainDesignId: detail.id,
      }
    );

    versionListRef.current?.hide();

    // 跳转到新版本
    navigateToVersion(id);
  };

  const handlePublish: VersionPublishProps['onSubmit'] = async values => {
    const { id, description } = values;

    await Promise.all([
      request.requestByPost('/wd/visual/web/domain-design-version/domain-design-version-update', {
        id,
        description,
      }),
      request.requestByPost('/wd/visual/web/domain-design-version/domain-design-version-publish', {
        id,
      }),
    ]);

    versionListRef.current?.hide();

    // 刷新当前页面
    router.replace(router.asPath);
  };

  const showVersionList = () => {
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
          <Button size="small" onClick={showVersionList}>
            查看历史版本
          </Button>
          {status === VersionStatus.UNPUBLISHED && (
            <Button
              size="small"
              onClick={() => {
                versionPublishRef.current?.open(detail.version);
              }}
            >
              发布
            </Button>
          )}
        </Space>
      }
      stats={
        <>
          <Card bordered size="small">
            <Statistic value={stats?.domainObject ?? 0} title="领域对象"></Statistic>
          </Card>
          <Card bordered size="small">
            <Statistic value={stats?.dataObject ?? 0} title="数据对象"></Statistic>
          </Card>
          <Card bordered size="small">
            <Statistic value={stats?.ubiquitousLanguage ?? 0} title="统一语言"></Statistic>
          </Card>
          <Card bordered size="small">
            <Statistic value={stats?.businessCapability ?? 0} title="能力"></Statistic>
          </Card>
          <Card bordered className="u-pointer" size="small" onClick={showVersionList}>
            <Statistic value={versionList?.totalCount ?? 0} title="版本"></Statistic>
          </Card>
          {/* <Card bordered size="small">
            <Statistic value={6} title="关联应用"></Statistic>
          </Card>
          <Card bordered size="small">
            <Statistic value={6} title="关联业务场景"></Statistic>
          </Card> */}
        </>
      }
      left={
        <>
          <Card size="small" title="简介">
            <PreviewPageSection name="描述">{detail.description || '未配置描述'}</PreviewPageSection>
            <PreviewPageSection name={`版本描述(${detail.version.currentVersion})`}>
              {detail.version.description || '未配置版本描述'}
            </PreviewPageSection>
            <PreviewPageSection name="愿景/目标">{dsl?.vision || '未配置愿景/目标'}</PreviewPageSection>
          </Card>
          <Card size="small" title="业务域概览">
            <Graph dsl={dsl} detail={detail} />
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
                  编辑
                </Button>
              )}
              <Button size="small" type="primary" onClick={navigateToDoc}>
                打开文档
              </Button>
            </Space>
          </Card>
        </>
      }
    >
      <UpdateDomain ref={updateRef} detail={detail} />
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

export default DomainReversion;
