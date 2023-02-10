import { useMemo } from 'react';
import { VersionBadge } from '@/lib/components/VersionBadge';
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
import { Button, Card, Space, Statistic } from 'antd';
import classNames from 'classnames';
import { request } from '@/modules/backend-client';

import { useLayoutTitle } from '../Layout';
import { DomainDetail, VersionStatus } from '../types';
import s from './Reversion.module.scss';
import { UpdateDomain, useUpdateDomain } from './Update';

export interface DomainReversionProps {
  detail: DomainDetail;
}

export const DomainReversion = (props: DomainReversionProps) => {
  const { detail } = props;
  const router = useRouter();
  useLayoutTitle(`业务域 - ${detail.name}`);
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
    router.push(`/team/${detail.teamId}/domain/${detail.id}/reversion/${id}/${action}`);
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

  return (
    <div className={classNames('vd-domain-rv', s.root)}>
      <div className={classNames('vd-domain-rv__meta', s.meta)}>
        <Space>
          <span className={classNames('vd-domain-rv__version', s.version)}>
            当前版本: <VersionBadge version={detail.version.currentVersion} status={detail.version.state} />
          </span>
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
      </div>
      <div className={classNames('vd-domain-rv__stats', s.stats)}>
        <Card bordered size="small">
          <Statistic value={10} title="领域模型"></Statistic>
        </Card>
        <Card bordered size="small">
          <Statistic value={6} title="数据模型"></Statistic>
        </Card>
        <Card bordered size="small">
          <Statistic value={6} title="统一语言"></Statistic>
        </Card>
        <Card bordered size="small">
          <Statistic value={6} title="能力"></Statistic>
        </Card>
        <Card bordered size="small">
          <Statistic value={6} title="版本"></Statistic>
        </Card>
        <Card bordered size="small">
          <Statistic value={6} title="关联应用"></Statistic>
        </Card>
        <Card bordered size="small">
          <Statistic value={6} title="关联业务场景"></Statistic>
        </Card>
      </div>
      <div className={classNames('vd-domain-rv__detail', s.detail)}>
        <div className={classNames('vd-domain-rv__col', s.col)}>
          <Card size="small" title="简介">
            <div className={classNames('vd-domain-rv-section', s.section)}>
              <div className={classNames('vd-domain-rv-section__name', s.sectionName)}>描述</div>
              {detail.description || '未配置描述'}
            </div>
            <div className={classNames('vd-domain-rv__section', s.section)}>
              <div className={classNames('vd-domain-rv-section__name', s.sectionName)}>
                版本描述({detail.version.currentVersion})
              </div>
              {detail.version.description}
            </div>
            <div className={classNames('vd-domain-rv__section', s.section)}>
              <div className={classNames('vd-domain-rv-section__name', s.sectionName)}>愿景/目标</div>
              {dsl?.vision || '未配置愿景/目标'}
            </div>
          </Card>
        </div>
        <div className={classNames('vd-domain-rv__col', s.col)}>
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
              <Button size="small" type="primary">
                打开文档
              </Button>
            </Space>
          </Card>
        </div>
      </div>
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
    </div>
  );
};

export default DomainReversion;
