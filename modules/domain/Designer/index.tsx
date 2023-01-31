import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useEffect, useMemo } from 'react';
import { message, Tabs } from 'antd';

import { DomainEditor } from '../domain-design';
import { DataObjectEditor } from '../data-design';

import s from './index.module.scss';
import { DomainDesignerContextProvider } from './Context';
import { DomainDesignerHeader } from './Header';
import { DomainDesignerLoading } from './Loading';
import { DomainDesignerTabs, DomainDesignerTabsMap, DomainDesignerModel } from './model';
import { TabLabel } from './TabLabel';
import { YJS_FIELD_NAME } from '../constants';
import { VisionDesign } from '../vision-design';
import { UbiquitousLanguage } from '../ubiquitous-language-design';
import { CompletionContextProvider } from '@/lib/components';
import { ProductDesign } from '../product-design';

export interface DomainDesignerProps {
  /**
   * 模型 id
   */
  id: string;

  /**
   * 是否为只读模式
   */
  readonly?: boolean;
}

/**
 * 领域模型设计器
 */
const DomainDesigner = observer(function DomainDesigner(props: DomainDesignerProps) {
  const { id, readonly } = props;
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
      children: <VisionDesign doc={model.ydoc} field={YJS_FIELD_NAME.VISION} />,
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
      label: DomainDesignerTabsMap[DomainDesignerTabs.Mapping],
      key: DomainDesignerTabs.Mapping,
      children: <div>敬请期待</div>,
    },
  ];

  useEffect(() => {
    if (model.error) {
      message.warning(model.error.message);
    }
  }, [model.error]);

  return (
    <DomainDesignerContextProvider value={model}>
      <CompletionContextProvider words={model.ubiquitousLanguageModel.words}>
        <div className={classNames('vd-domain', s.root)}>
          <DomainDesignerLoading></DomainDesignerLoading>
          <DomainDesignerHeader></DomainDesignerHeader>
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
