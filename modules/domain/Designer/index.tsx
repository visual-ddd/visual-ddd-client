import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useEffect, useMemo } from 'react';
import { message, Tabs } from 'antd';
import { DomainDesignerTabs, DomainDesignerTabsMap, DomainDesignerModel } from './model';

import { DomainEditor } from '../domain-design';
import { DataObjectEditor } from '../data-design';

import s from './index.module.scss';
import { DomainDesignerContextProvider } from './Context';
import { DomainDesignerHeader } from './Header';
import { DomainDesignerLoading } from './Loading';
import { TabLabel } from './TabLabel';

export interface DomainDesignerProps {
  /**
   * 模型 id
   */
  id: string;
}

/**
 * 领域模型设计器
 */
const DomainDesigner = observer(function DomainDesigner(props: DomainDesignerProps) {
  const { id } = props;
  const model = useMemo(() => {
    const instance = new DomainDesignerModel({ id });

    instance.load();

    return instance;
  }, [id]);

  const items = [
    {
      label: DomainDesignerTabsMap[DomainDesignerTabs.Product],
      key: DomainDesignerTabs.Product,
      children: <div>敬请期待</div>,
    },
    {
      label: DomainDesignerTabsMap[DomainDesignerTabs.Vision],
      key: DomainDesignerTabs.Vision,
      children: <div>敬请期待</div>,
    },
    {
      label: DomainDesignerTabsMap[DomainDesignerTabs.UbiquitousLanguage],
      key: DomainDesignerTabs.UbiquitousLanguage,
      children: <div>敬请期待</div>,
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
    </DomainDesignerContextProvider>
  );
});

export default DomainDesigner;
