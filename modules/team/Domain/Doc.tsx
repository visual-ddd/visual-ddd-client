import { useYDocFromBase64 } from '@/lib/yjs-store-api-for-browser';
import { VersionBadge } from '@/lib/components/VersionBadge';
import type { UbiquitousLanguageItem } from '@/modules/domain/ubiquitous-language-design/types';
import type { BusinessDomainDSL } from '@/modules/domain/api/dsl/interface';
import { YJS_FIELD_NAME } from '@/modules/domain/constants';
import classNames from 'classnames';
import { Table } from 'antd';
import type { ColumnType } from 'antd/es/table';
import { useMemo } from 'react';
import { NoopArray } from '@wakeapp/utils';

import { DomainDetail } from '../types';

import s from './Doc.module.scss';
import { StaticEditor } from '@/lib/wysiwyg-editor/StaticEditor';
import dynamic from 'next/dynamic';

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

const DomainEditor = dynamic(() => import('@/modules/domain/domain-design/StandaloneDomainEditor'), { ssr: false });
const DataObjectEditor = dynamic(() => import('@/modules/domain/data-design/StandaloneDataObjectEditor'), {
  ssr: false,
});

/**
 * 业务域文档
 */
export const Doc = (props: DocProps) => {
  const { detail } = props;

  const dsl = useMemo<BusinessDomainDSL>(() => {
    return detail.version.domainDesignDsl ? JSON.parse(detail.version.domainDesignDsl) : undefined;
  }, [detail.version.domainDesignDsl]);

  const yjsDoc = useYDocFromBase64(detail.version.graphDsl, true);

  const ubList = dsl.ubiquitousLanguage ?? NoopArray;

  const productionContent = useMemo(() => {
    if (yjsDoc) {
      return yjsDoc.getXmlFragment(YJS_FIELD_NAME.PRODUCT);
    }
    return;
  }, [yjsDoc]);

  return (
    <div className={s.root}>
      <h1 className={s.title}>{detail.name}</h1>
      <section className={s.header}>
        <div className={s.meta}>
          <span>标识符：{detail.identity}</span>
          <span>
            版本：
            <VersionBadge version={detail.version.currentVersion} status={detail.version.state} type="text" />
          </span>
          <span>最后更新于：{detail.version.updateTime}</span>
        </div>
        <blockquote className={classNames(s.description)}>
          <p>{detail.description || '业务域描述'}</p>
        </blockquote>
      </section>
      <section>
        <h2>术语表(统一语言)</h2>
        <Table columns={ubColumns} dataSource={ubList} rowKey="uuid" pagination={false}></Table>
      </section>
      <section>
        <h2>业务背景</h2>
        <p>{dsl.vision || '未设置'}</p>
      </section>
      <section>{!!productionContent && <StaticEditor content={productionContent} className={s.editor} />}</section>
      <section>
        <h2>领域模型</h2>
        <DomainEditor dsl={yjsDoc} />
      </section>
      <section>
        <h2>数据模型</h2>
        <DataObjectEditor dsl={yjsDoc} />
      </section>
      <section>
        <h2>接口文档</h2>
        <div>TODO:</div>
      </section>
    </div>
  );
};
