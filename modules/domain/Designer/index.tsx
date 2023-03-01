import { observer } from 'mobx-react';
import { useEffect, useMemo } from 'react';
import { message } from 'antd';
import { tryDispose } from '@/lib/utils';
import { IUser, VersionStatus } from '@/lib/core';
import { CompletionContextProvider } from '@/lib/components/Completion';
import { DesignerLayout, DesignerTabLabel } from '@/lib/components/DesignerLayout';
import { usePreventUnload } from '@/lib/hooks';
import { NoopArray } from '@wakeapp/utils';

import { DomainEditor } from '../domain-design';
import { DataObjectEditor } from '../data-design';

import { YJS_FIELD_NAME } from '../constants';
import { VisionDesign } from '../vision-design';
import { UbiquitousLanguage } from '../ubiquitous-language-design';
import { ProductDesign } from '../product-design';
import { MapperEditor } from '../mapper-design';

import { DomainDesignerContextProvider } from './Context';
import { DomainDesignerHeader } from './Header';
import { DomainDesignerLoading } from './Loading';
import { DomainDesignerTabs, DomainDesignerTabsMap, DomainDesignerModel } from './model';

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
  user?: IUser;
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

  /**
   * 统一语言单词
   */
  words?: string[];
}

/**
 * 领域模型设计器
 */
const DomainDesigner = observer(function DomainDesigner(props: DomainDesignerProps) {
  const { id, readonly, description, words } = props;
  const model = useMemo(() => new DomainDesignerModel({ id, readonly }), [id, readonly]);

  const globalWords = useMemo(() => (words ?? NoopArray).filter(i => !!i.trim()), [words]);

  const autoCompletionWords = useMemo(() => {
    return globalWords.concat(model.ubiquitousLanguageModel.words);
  }, [globalWords, model.ubiquitousLanguageModel.words]);

  const items = [
    {
      label: DomainDesignerTabsMap[DomainDesignerTabs.Product],
      key: DomainDesignerTabs.Product,
      children: (
        <ProductDesign
          doc={model.ydoc}
          field={YJS_FIELD_NAME.PRODUCT}
          readonly={model.readonly}
          awareness={model.rawAwareness}
          user={description?.user}
        />
      ),
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
        <DesignerTabLabel model={model.domainEditorModel}>
          {DomainDesignerTabsMap[DomainDesignerTabs.DomainModel]}
        </DesignerTabLabel>
      ),
      key: DomainDesignerTabs.DomainModel,
      children: (
        <DomainEditor model={model.domainEditorModel} active={model.activeTab === DomainDesignerTabs.DomainModel} />
      ),
    },
    {
      label: (
        <DesignerTabLabel model={model.queryEditorModel}>
          {DomainDesignerTabsMap[DomainDesignerTabs.QueryModel]}
        </DesignerTabLabel>
      ),
      key: DomainDesignerTabs.QueryModel,
      children: (
        <DomainEditor model={model.queryEditorModel} active={model.activeTab === DomainDesignerTabs.QueryModel} />
      ),
    },
    {
      label: (
        <DesignerTabLabel model={model.dataObjectEditorModel}>
          {DomainDesignerTabsMap[DomainDesignerTabs.DataModel]}
        </DesignerTabLabel>
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
        <DesignerTabLabel model={model.mapperObjectEditorModel}>
          {DomainDesignerTabsMap[DomainDesignerTabs.Mapper]}
        </DesignerTabLabel>
      ),
      key: DomainDesignerTabs.Mapper,
      children: (
        <MapperEditor model={model.mapperObjectEditorModel} active={model.activeTab === DomainDesignerTabs.Mapper} />
      ),
    },
  ];

  useEffect(() => {
    if (model.error) {
      console.error(model.error);
      message.warning(model.error.message);
    }
  }, [model.error]);

  // 加载和销毁
  useEffect(() => {
    model.initialize();
    model.load();
    model.setAwarenessState({
      user: description?.user,
    });

    return () => {
      tryDispose(model);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  usePreventUnload(!readonly);

  return (
    <DomainDesignerContextProvider value={model}>
      <CompletionContextProvider words={autoCompletionWords}>
        <DesignerLayout
          items={items}
          activeKey={model.activeTab}
          onActiveKeyChange={tab => model.setActiveTab({ tab: tab as DomainDesignerTabs })}
        >
          <DomainDesignerLoading></DomainDesignerLoading>
          <DomainDesignerHeader
            user={description?.user}
            name={description?.name}
            version={description?.version}
            versionStatus={description?.versionStatus}
          ></DomainDesignerHeader>
        </DesignerLayout>
      </CompletionContextProvider>
    </DomainDesignerContextProvider>
  );
});

export default DomainDesigner;
