import { useMemo } from 'react';
import { VersionBadge } from '@/lib/components';
import type { BusinessDomainDSL } from '@/modules/domain/api/dsl/interface';
import { Button, Card, Space, Statistic } from 'antd';
import classNames from 'classnames';

import { useLayoutTitle } from '../Layout';
import { DomainDetail, DomainVersionStatus } from '../types';
import s from './Reversion.module.scss';
import { UpdateDomain, useUpdateDomain } from './Update';

export interface DomainReversionProps {
  detail: DomainDetail;
}

export const DomainReversion = (props: DomainReversionProps) => {
  const { detail } = props;
  useLayoutTitle(`业务域 - ${detail.name}`);
  const updateRef = useUpdateDomain();
  const status = detail.domainDesignLatestVersion.state;
  const dslStr = detail.domainDesignLatestVersion.domainDesignDsl;
  const dsl = useMemo<BusinessDomainDSL | undefined>(() => {
    if (dslStr) {
      return JSON.parse(dslStr);
    }
  }, [dslStr]);

  return (
    <div className={classNames('vd-domain-rv', s.root)}>
      <div className={classNames('vd-domain-rv__desc', s.desc)}>{detail.description || '未配置描述'}</div>
      <div className={classNames('vd-domain-rv__meta', s.meta)}>
        <Space>
          <span className={classNames('vd-domain-rv__version', s.version)}>
            当前版本:{' '}
            <VersionBadge
              version={detail.domainDesignLatestVersion.currentVersion}
              status={status === DomainVersionStatus.PUBLISHED ? '已发布' : '未发布'}
            />
          </span>
          <Button size="small">Fork 版本</Button>
          <Button size="small">查看历史版本</Button>
          {status === DomainVersionStatus.UNPUBLISHED && <Button size="small">发布</Button>}
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
          <Card size="small" title="愿景/目标">
            {dsl?.vision || '未配置愿景/目标'}
          </Card>
        </div>
        <div className={classNames('vd-domain-rv__col', s.col)}>
          <Card size="small" title="操作">
            <Space>
              <Button size="small" type="primary" onClick={() => updateRef.current?.open()}>
                设置
              </Button>
              <Button size="small" type="primary">
                {status === DomainVersionStatus.PUBLISHED ? '查看' : '编辑'}
              </Button>
              <Button size="small" type="primary">
                打开自动文档
              </Button>
            </Space>
          </Card>
        </div>
      </div>
      <UpdateDomain ref={updateRef} detail={detail} />
    </div>
  );
};

export default DomainReversion;
