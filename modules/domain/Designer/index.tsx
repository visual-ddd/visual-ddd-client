import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useEffect, useMemo } from 'react';
import { message, Tabs } from 'antd';
import { tryDispose } from '@/lib/utils';
import { VersionStatus } from '@/lib/core';
import { useRouter } from 'next/router';
import { CompletionContextProvider } from '@/lib/components/Completion';

import { DomainEditor } from '../domain-design';
import { DataObjectEditor } from '../data-design';

import { YJS_FIELD_NAME } from '../constants';
import { VisionDesign } from '../vision-design';
import { UbiquitousLanguage } from '../ubiquitous-language-design';
import { ProductDesign } from '../product-design';
import { MapperEditor } from '../mapper-design';

import s from './index.module.scss';
import { DomainDesignerContextProvider } from './Context';
import { DomainDesignerHeader } from './Header';
import { DomainDesignerLoading } from './Loading';
import { DomainDesignerTabs, DomainDesignerTabsMap, DomainDesignerModel } from './model';
import { TabLabel } from './TabLabel';

export interface DomainDescription {
  id: string | number;

  /**
   * 模型名称
   */
  name: string;

  /**
   * 版本 id
   */
  versionId: string | number;

  /**
   * 版本号
   */
  version: string;

  /**
   * 版本状态
   */
  versionStatus: VersionStatus;

  /**
   * 当前用户
   */
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface DomainDesignerProps {
  /**
   * 模型 id
   */
  id: string;

  /**
   * 模型信息
   */
  description?: DomainDescription;

  /**
   * 是否为只读模式
   */
  readonly?: boolean;
}

/**
 * 领域模型设计器
 */
const DomainDesigner = observer(function DomainDesigner(props: DomainDesignerProps) {
  const { id, readonly, description } = props;
  const router = useRouter();
  const model = useMemo(() => {
    const instance = new DomainDesignerModel({ id, readonly });

    instance.load();

    return instance;
  }, [id, readonly]);

  const items = [
    {
      label: DomainDesignerTabsMap[DomainDesignerTabs.Product],
      key: DomainDesignerTabs.Product,
      children: <ProductDesign doc={model.ydoc} field={YJS_FIELD_NAME.PRODUCT} readonly={model.readonly} />,
    },
    {
      label: DomainDesignerTabsMap[DomainDesignerTabs.Vision],
      key: DomainDesignerTabs.Vision,
      children: <VisionDesign doc={model.ydoc} field={YJS_FIELD_NAME.VISION} readonly={model.readonly} />,
    },
    {
      label: DomainDesignerTabsMap[DomainDesignerTabs.UbiquitousLanguage],
      key: DomainDesignerTabs.UbiquitousLanguage,
      children: <UbiquitousLanguage model={model.ubiquitousLanguageModel} />,
    },
    {
      label: (
        <TabLabel model={model.domainEditorModel}>{DomainDesignerTabsMap[DomainDesignerTabs.DomainModel]}</TabLabel>
      ),
      key: DomainDesignerTabs.DomainModel,
      children: (
        <DomainEditor model={model.domainEditorModel} active={model.activeTab === DomainDesignerTabs.DomainModel} />
      ),
    },
    {
      label: <TabLabel model={model.queryEditorModel}>{DomainDesignerTabsMap[DomainDesignerTabs.QueryModel]}</TabLabel>,
      key: DomainDesignerTabs.QueryModel,
      children: (
        <DomainEditor model={model.queryEditorModel} active={model.activeTab === DomainDesignerTabs.QueryModel} />
      ),
    },
    {
      label: (
        <TabLabel model={model.dataObjectEditorModel}>{DomainDesignerTabsMap[DomainDesignerTabs.DataModel]}</TabLabel>
      ),
      key: DomainDesignerTabs.DataModel,
      children: (
        <DataObjectEditor
          model={model.dataObjectEditorModel}
          active={model.activeTab === DomainDesignerTabs.DataModel}
        ></DataObjectEditor>
      ),
    },
    {
      label: (
        <TabLabel model={model.mapperObjectEditorModel}>{DomainDesignerTabsMap[DomainDesignerTabs.Mapper]}</TabLabel>
      ),
      key: DomainDesignerTabs.Mapper,
      children: (
        <MapperEditor model={model.mapperObjectEditorModel} active={model.activeTab === DomainDesignerTabs.Mapper} />
      ),
    },
  ];

  useEffect(() => {
    if (model.error) {
      message.warning(model.error.message);
    }
  }, [model.error]);

  useEffect(() => {
    return () => {
      tryDispose(model);
    };
  }, [model]);

  /**
   * 关闭阻止
   */
  useEffect(() => {
    if (readonly) {
      return;
    }

    const listener = (evt: Event) => {
      evt.preventDefault();

      // @ts-expect-error
      return (evt.returnValue = '确定关闭吗？');
    };

    window.addEventListener('beforeunload', listener, { capture: true });
    router.beforePopState(() => {
      const confirm = window.confirm('确定关闭吗？');

      return confirm;
    });

    return () => {
      window.removeEventListener('beforeunload', listener, { capture: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readonly]);

  return (
    <DomainDesignerContextProvider value={model}>
      <CompletionContextProvider words={model.ubiquitousLanguageModel.words}>
        <div className={classNames('vd-domain', s.root)}>
          <DomainDesignerLoading></DomainDesignerLoading>
          <DomainDesignerHeader
            name={description?.name}
            version={description?.version}
            versionStatus={description?.versionStatus}
          ></DomainDesignerHeader>
          <Tabs
            className={classNames('vd-domain-body', s.body)}
            items={items}
            tabPosition="bottom"
            activeKey={model.activeTab}
            onChange={tab => model.setActiveTab({ tab: tab as DomainDesignerTabs })}
            tabBarGutter={20}
            size="small"
          ></Tabs>
        </div>
      </CompletionContextProvider>
    </DomainDesignerContextProvider>
  );
});

export default DomainDesigner;
