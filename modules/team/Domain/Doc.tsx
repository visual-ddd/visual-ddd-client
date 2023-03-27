import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useYDocFromBase64 } from '@/lib/yjs-store-api-for-browser';
import { VersionBadge } from '@/lib/components/VersionBadge';
import type { UbiquitousLanguageItem } from '@/modules/domain/ubiquitous-language-design/types';
import type { BusinessDomainDSL } from '@/modules/domain/api/dsl/interface';
import { YJS_FIELD_NAME } from '@/modules/domain/constants';
import { useSession } from '@/modules/session';
import classNames from 'classnames';
import { Button, Table } from 'antd';
import type { ColumnType } from 'antd/es/table';
import { useMemo } from 'react';
import { NoopArray } from '@wakeapp/utils';

import { DomainDetail } from '../types';

import s from './Doc.module.scss';
import { APiDoc } from './ApiDoc/ApiDoc';

export interface DocProps {
  detail: DomainDetail;
}

const ubColumns: ColumnType<UbiquitousLanguageItem>[] = [
  {
    dataIndex: 'conception',
    title: '概念',
    width: 80,
  },
  {
    dataIndex: 'englishName',
    title: '英文',
  },
  {
    dataIndex: 'definition',
    title: '定义',
  },
  {
    dataIndex: 'restraint',
    title: '约束',
  },
  {
    dataIndex: 'example',
    title: '示例',
  },
];

// 不支持 SSR，因此这里异步加载了
const StaticEditor = dynamic(() => import('@/lib/wysiwyg-editor/StaticEditor'), { ssr: false });
const DomainEditor = dynamic(() => import('@/modules/domain/domain-design/StandaloneDomainEditor'), { ssr: false });
const DataObjectEditor = dynamic(() => import('@/modules/domain/data-design/StandaloneDataObjectEditor'), {
  ssr: false,
});

/**
 * 业务域文档
 */
export const Doc = (props: DocProps) => {
  const { detail } = props;
  const session = useSession({ shouldRedirect: false });

  const dsl = useMemo<BusinessDomainDSL | undefined>(() => {
    return detail.version.domainDesignDsl ? JSON.parse(detail.version.domainDesignDsl) : undefined;
  }, [detail.version.domainDesignDsl]);

  const yjsDoc = useYDocFromBase64(detail.version.graphDsl, true);

  const ubList = dsl?.ubiquitousLanguage ?? NoopArray;

  const productionContent = useMemo(() => {
    if (yjsDoc) {
      return yjsDoc.getXmlFragment(YJS_FIELD_NAME.PRODUCT);
    }
    return;
  }, [yjsDoc]);

  return (
    <div className={s.root}>
      <Head>
        <title>{`${detail.name} - 业务域`}</title>
      </Head>
      <h1 id="title" className={s.title}>
        {detail.name}
      </h1>
      <section className={s.header}>
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
        <blockquote className={classNames(s.description)}>
          <p>
            <b>业务域说明</b>
            <br />
            {detail.description || '业务域描述'}
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
                      `/team/${detail.teamId}/domain/${detail.id}/reversion/${detail.version.id}`
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
        <h2 id="ubiquitous-language">术语表(统一语言)</h2>
        <Table columns={ubColumns} dataSource={ubList} rowKey="uuid" pagination={false}></Table>
      </section>
      <section>
        <h2 id="background">业务背景</h2>
        <p>{dsl?.vision || '未设置'}</p>
      </section>
      <section>{!!productionContent && <StaticEditor content={productionContent} className={s.editor} />}</section>
      <section>
        <h2 id="domain-model">领域模型</h2>
        <DomainEditor dsl={yjsDoc} />
      </section>
      {!!(dsl && dsl.dataModel.dataObjects.length) && (
        <section>
          <h2 id="data-model">数据模型</h2>
          <DataObjectEditor dsl={yjsDoc} />
        </section>
      )}
      <section>
        <h2 id="api">接口文档</h2>
        <div>{dsl && <APiDoc dsl={dsl} />}</div>
      </section>
    </div>
  );
};
