import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { Tabs } from 'antd';
import { DomainDesignerTabs, DomainDesignerTabsMap, DomainDesignerModel } from './model';

import { DomainEditor } from '../domain-design';

import s from './index.module.scss';
import { DomainDesignerContextProvider } from './Context';
import { DomainDesignerHeader } from './Header';

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
    return new DomainDesignerModel({ id });
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
      label: DomainDesignerTabsMap[DomainDesignerTabs.DomainModel],
      key: DomainDesignerTabs.DomainModel,
      children: (
        <DomainEditor model={model.domainEditorModel} active={model.activeTab === DomainDesignerTabs.DomainModel} />
      ),
    },
    {
      label: DomainDesignerTabsMap[DomainDesignerTabs.QueryModel],
      key: DomainDesignerTabs.QueryModel,
      children: (
        <DomainEditor model={model.queryEditorModel} active={model.activeTab === DomainDesignerTabs.QueryModel} />
      ),
    },
    {
      label: DomainDesignerTabsMap[DomainDesignerTabs.DataModel],
      key: DomainDesignerTabs.DataModel,
      children: <div>敬请期待</div>,
    },
    {
      label: DomainDesignerTabsMap[DomainDesignerTabs.Mapping],
      key: DomainDesignerTabs.Mapping,
      children: <div>敬请期待</div>,
    },
  ];

  return (
    <DomainDesignerContextProvider value={model}>
      <div className={classNames('vd-domain', s.root)}>
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
