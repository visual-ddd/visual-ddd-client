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
import { download, request, useRequestPaginationByGet } from '@/modules/backend-client';

import { useLayoutTitle } from '@/modules/Layout';
import { AppDetail, DomainSimple, ScenarioSimple, VersionStatus } from '../types';
import { UpdateApp, useUpdateApp } from './Update';
import { Association, AssociationProps, IAssociable, useAssociation } from './Association';
import Graph from './Graph';

export interface AppReversionProps {
  detail: AppDetail;
}

export const AppReversion = (props: AppReversionProps) => {
  const { detail } = props;
  const router = useRouter();
  useLayoutTitle(`${detail.name}`);
  const updateRef = useUpdateApp();
  const versionListRef = useVersionListRef();
  const versionCreateRef = useVersionCreateRef();
  const versionPublishRef = useVersionPublishRef();
  const domainAssociationRef = useAssociation();
  const scenarioAssociationRef = useAssociation();
  const status = detail.version.state;
  const readonly = status === VersionStatus.PUBLISHED;

  const { data: versionList } = useRequestPaginationByGet(
    `/wd/visual/web/application-version/application-version-page-query?pageNo=1&pageSize=1&searchCount=true&applicationId=${detail.id}`
  );

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

  /**
   * 请求业务场景列表
   * @returns
   */
  const requestScenarioAssociations: AssociationProps['onRequest'] = async () => {
    // 业务场景列表
    const list = await request.requestByGet<ScenarioSimple[]>(
      '/wd/visual/web/business-scene/business-scene-page-query',
      {
        teamId: detail.teamId,
        pageNo: 1,
        pageSize: 1000,
      }
    );

    return list.map<IAssociable>(i => {
      return {
        ...i,
        // 当前关联的版本
        version: detail.version.businessSceneVersionDTOList?.find(j => {
          return j.businessSceneId === i.id;
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

  const requestScenarioVersionList: AssociationProps['onRequestVersions'] = async id => {
    const list = await request.requestByGet<IVersion[]>(
      '/wd/visual/web/business-scene-version/business-scene-version-page-query',
      {
        businessSceneId: id,
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

  const saveScenarioAssociations: AssociationProps['onFinish'] = async result => {
    await request.requestByPost('/wd/visual/web/application-version/business-scene-version-bind', {
      id: detail.version.id,
      businessSceneVersionIds: result.versionIds,
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

  const handleOpenVersions = () => versionListRef.current?.open();

  const handleOpenDomains = () => {
    domainAssociationRef.current?.open();
  };

  const handleOpenScenarios = () => {
    scenarioAssociationRef.current?.open();
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
          <Button size="small" onClick={handleOpenVersions}>
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
          <Card bordered size="small" onClick={handleOpenDomains} className="u-pointer">
            <Statistic value={detail.version.domainDesignVersionIds?.length ?? 0} title="业务域"></Statistic>
          </Card>
          <Card bordered size="small" onClick={handleOpenScenarios} className="u-pointer">
            <Statistic value={detail.version.businessSceneVersionIds?.length ?? 0} title="业务场景"></Statistic>
          </Card>
          {/* <Card bordered size="small">
            <Statistic value={6} title="统一语言"></Statistic>
          </Card> */}
          {/* <Card bordered size="small">
            <Statistic value={6} title="领域模型"></Statistic>
          </Card> */}
          {/* <Card bordered size="small">
            <Statistic value={6} title="数据模型"></Statistic>
          </Card>
          <Card bordered size="small">
            <Statistic value={6} title="能力"></Statistic>
          </Card> */}
          <Card bordered size="small" onClick={handleOpenVersions} className="u-pointer">
            <Statistic value={versionList?.totalCount ?? 0} title="版本"></Statistic>
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
          <Card size="small" title="概览图">
            <Graph detail={detail} />
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
              <Button size="small" type="primary" onClick={handleOpenDomains}>
                关联业务域
              </Button>
              <Button size="small" type="primary" onClick={handleOpenScenarios}>
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
      <Association
        name="业务场景"
        identify={`${detail.id}.scenario`}
        onRequest={requestScenarioAssociations}
        onRequestVersions={requestScenarioVersionList}
        onFinish={saveScenarioAssociations}
        ref={scenarioAssociationRef}
        readonly={readonly}
      ></Association>
    </PreviewPageLayout>
  );
};

export default AppReversion;
