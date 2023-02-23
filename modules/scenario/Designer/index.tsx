import { observer } from 'mobx-react';
import { useEffect, useMemo } from 'react';
import { message } from 'antd';
import { tryDispose } from '@/lib/utils';
import { VersionStatus } from '@/lib/core';
import { DesignerHeader, DesignerLayout, DesignerLoading } from '@/lib/components/DesignerLayout';

import { ScenarioDesignerContextProvider } from './Context';
import { ScenarioDesignerTabs, ScenarioDesignerTabsMap, ScenarioDesignerModel } from './model';
import { ScenarioEditor } from '../scenario-design';
import { usePreventUnload } from '@/lib/hooks';

export interface ScenarioDescription {
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

export interface ScenarioDesignerProps {
  /**
   * 模型 id
   */
  id: string;

  /**
   * 模型信息
   */
  description?: ScenarioDescription;

  /**
   * 是否为只读模式
   */
  readonly?: boolean;
}

/**
 * 领域模型设计器
 */
const ScenarioDesigner = observer(function ScenarioDesigner(props: ScenarioDesignerProps) {
  const { id, readonly, description } = props;
  const model = useMemo(() => {
    const instance = new ScenarioDesignerModel({ id, readonly });

    instance.load();

    return instance;
  }, [id, readonly]);

  const saveTooltip = useMemo(() => {
    const desc = model.keyboardBinding.getReadableKeyBinding('save');
    return `${desc.description}(${desc.key})`;
  }, [model]);

  const items = [
    {
      label: ScenarioDesignerTabsMap[ScenarioDesignerTabs.Scenario],
      key: ScenarioDesignerTabs.Scenario,
      children: <ScenarioEditor model={model.scenarioEditorModel} />,
    },
    {
      label: ScenarioDesignerTabsMap[ScenarioDesignerTabs.Service],
      key: ScenarioDesignerTabs.Service,
      children: <div>TODO:</div>,
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

  usePreventUnload(!readonly);

  return (
    <ScenarioDesignerContextProvider value={model}>
      <DesignerLayout
        items={items}
        activeKey={model.activeTab}
        onActiveKeyChange={tab => model.setActiveTab({ tab: tab as ScenarioDesignerTabs })}
      >
        <DesignerLoading loading={model.loading} />
        <DesignerHeader
          name={description?.name}
          version={description?.version}
          versionStatus={description?.versionStatus}
          title={ScenarioDesignerTabsMap[model.activeTab]}
          readonly={model.readonly}
          saveTooltip={saveTooltip}
          saving={model.saving}
          onSave={() => model.keyboardBinding.trigger('save')}
        ></DesignerHeader>
      </DesignerLayout>
    </ScenarioDesignerContextProvider>
  );
});

export default ScenarioDesigner;
