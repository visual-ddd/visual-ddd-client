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
import { request } from '@/modules/backend-client';

import { useLayoutTitle } from '../Layout';
import { AppDetail, VersionStatus } from '../types';
import { UpdateApp, useUpdateApp } from './Update';

export interface AppReversionProps {
  detail: AppDetail;
}

export const AppReversion = (props: AppReversionProps) => {
  const { detail } = props;
  const router = useRouter();
  useLayoutTitle(`应用 - ${detail.name}`);
  const updateRef = useUpdateApp();
  const versionListRef = useVersionListRef();
  const versionCreateRef = useVersionCreateRef();
  const versionPublishRef = useVersionPublishRef();
  const status = detail.version.state;

  const requestVersionList: VersionListProps['onRequest'] = async ({ pageNo, pageSize }) => {
    const { totalCount, data } = await request.requestPaginationByGet(
      '/wd/visual/web/application-version/application-version-page-query',
      {
        pageNo,
        pageSize,
        searchCount: true,
        applicationId: detail.id,
      }
    );

    return { data, total: totalCount };
  };

  const navigateToVersion = (id: number) => {
    router.push(`/team/${detail.teamId}/app/${detail.id}/reversion/${id}`);
  };

  const handleCreateVersion: VersionCreateProps['onSubmit'] = async values => {
    const id = await request.requestByPost<number>('/wd/visual/web/application-version/application-version-create', {
      ...values,
      applicationId: detail.id,
    });

    versionListRef.current?.hide();

    // 跳转到新版本
    navigateToVersion(id);
  };

  const handlePublish: VersionPublishProps['onSubmit'] = async values => {
    const { id, description } = values;

    await Promise.all([
      request.requestByPost('/wd/visual/web/application-version/application-version-update', {
        id,
        description,
      }),
      request.requestByPost('/wd/visual/web/application-version/application-version-publish', {
        id,
      }),
    ]);

    versionListRef.current?.hide();

    // 刷新当前页面
    router.replace(router.asPath);
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
          <Button size="small" onClick={() => versionListRef.current?.open()}>
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
            <Statistic value={10} title="业务域"></Statistic>
          </Card>
          <Card bordered size="small">
            <Statistic value={6} title="业务场景"></Statistic>
          </Card>
          <Card bordered size="small">
            <Statistic value={6} title="统一语言"></Statistic>
          </Card>
          <Card bordered size="small">
            <Statistic value={6} title="领域模型"></Statistic>
          </Card>
          <Card bordered size="small">
            <Statistic value={6} title="数据模型"></Statistic>
          </Card>
          <Card bordered size="small">
            <Statistic value={6} title="能力"></Statistic>
          </Card>
          <Card bordered size="small">
            <Statistic value={6} title="版本"></Statistic>
          </Card>
        </>
      }
      left={
        <>
          <Card size="small" title="简介">
            <PreviewPageSection name="包名">{detail.packageName}</PreviewPageSection>
            <PreviewPageSection name="描述">{detail.description || '未配置描述'}</PreviewPageSection>
            <PreviewPageSection name={`版本描述(${detail.version.currentVersion})`}>
              {detail.version.description || '未配置版本描述'}
            </PreviewPageSection>
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
              <Button size="small" type="primary">
                关联业务域
              </Button>
              <Button size="small" type="primary">
                关联业务场景
              </Button>
              <Button size="small" type="primary">
                接口列表
              </Button>
              <Button size="small" type="primary">
                下载脚手架
              </Button>
            </Space>
          </Card>
        </>
      }
    >
      <VersionList
        onRequest={requestVersionList}
        ref={versionListRef}
        editable={false}
        previewable={false}
        onFork={v => {
          versionCreateRef.current?.open(v);
        }}
        onNavigate={v => {
          navigateToVersion(v.id);
        }}
      />
      <VersionCreate ref={versionCreateRef} onSubmit={handleCreateVersion} />
      <VersionPublish ref={versionPublishRef} onSubmit={handlePublish} />
      <UpdateApp ref={updateRef} detail={detail} />
    </PreviewPageLayout>
  );
};

export default AppReversion;
