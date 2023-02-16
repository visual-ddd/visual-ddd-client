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
  IVersion,
} from '@/lib/components/VersionControl';
import { PreviewPageLayout, PreviewPageSection, PreviewPageVersion } from '@/lib/components/PreviewPageLayout';
import { Button, Card, Space, Statistic, Modal, message } from 'antd';
import classNames from 'classnames';
import { download, request } from '@/modules/backend-client';

import { useLayoutTitle } from '@/modules/Layout';
import { AppDetail, DomainSimple, VersionStatus } from '../types';
import { UpdateApp, useUpdateApp } from './Update';
import { Association, AssociationProps, IAssociable, useAssociation } from './Association';

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
  const domainAssociationRef = useAssociation();
  const status = detail.version.state;
  const readonly = status === VersionStatus.PUBLISHED;

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

  const requestDomainAssociations: AssociationProps['onRequest'] = async () => {
    const list = await request.requestByGet<DomainSimple[]>('/wd/visual/web/domain-design/domain-design-page-query', {
      teamId: detail.teamId,
      pageNo: 1,
      pageSize: 1000,
    });

    return list.map<IAssociable>(i => {
      return {
        ...i,
        version: detail.version.domainDesignVersionDTOList?.find(j => {
          return j.domainDesignId === i.id;
        }),
      };
    });
  };

  const requestDomainVersionList: AssociationProps['onRequestVersions'] = async id => {
    const list = await request.requestByGet<IVersion[]>(
      '/wd/visual/web/domain-design-version/domain-design-version-page-query',
      {
        domainDesignId: id,
        pageNo: 1,
        pageSize: 10000,
      }
    );
    return list;
  };

  /**
   * 保存业务域关联
   * @param result
   */
  const saveDomainAssociations: AssociationProps['onFinish'] = async result => {
    await request.requestByPost('/wd/visual/web/application-version/domain-design-version-bind', {
      id: detail.version.id,
      domainDesignVersionIds: result.versionIds,
    });

    router.replace(router.asPath);
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

  /**
   * 下载脚手架
   */
  const handleDownload = () => {
    Modal.confirm({
      content: '确定下载脚手架？',
      onOk: async () => {
        try {
          await download({
            method: 'POST',
            filename: '项目脚手架.zip',
            name: '/wd/visual/web/application-version/application-code-generate',
            body: {
              id: detail.version.id,
            },
          });
        } catch (err) {
          message.error(`下载项目脚手架失败：${(err as Error).message}`);
        }
      },
    });
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
              <Button
                size="small"
                type="primary"
                onClick={() => {
                  domainAssociationRef.current?.open();
                }}
              >
                关联业务域
              </Button>
              <Button size="small" type="primary">
                关联业务场景
              </Button>
              <Button size="small" type="primary">
                接口列表
              </Button>
              <Button size="small" type="primary" onClick={handleDownload}>
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
      <Association
        name="业务域"
        identify={`${detail.id}.domain`}
        onRequest={requestDomainAssociations}
        onRequestVersions={requestDomainVersionList}
        ref={domainAssociationRef}
        onFinish={saveDomainAssociations}
        readonly={readonly}
      />
    </PreviewPageLayout>
  );
};

export default AppReversion;
