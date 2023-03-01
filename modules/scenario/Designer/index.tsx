import { observer } from 'mobx-react';
import { useEffect, useMemo } from 'react';
import { message } from 'antd';
import { tryDispose } from '@/lib/utils';
import { VersionStatus } from '@/lib/core';
import { DesignerHeader, DesignerLayout, DesignerLoading, DesignerTabLabel } from '@/lib/components/DesignerLayout';
import { NoopArray } from '@wakeapp/utils';
import { CompletionContextProvider } from '@/lib/components/Completion';
import { usePreventUnload } from '@/lib/hooks';

import { ScenarioDesignerContextProvider } from './Context';
import { ScenarioDesignerTabs, ScenarioDesignerTabsMap, ScenarioDesignerModel } from './model';
import { ScenarioEditor } from '../scenario-design';
import { DomainEditor } from '../service-design';

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

  /**
   * 统一语言单词
   */
  words?: string[];
}

/**
 * 领域模型设计器
 */
const ScenarioDesigner = observer(function ScenarioDesigner(props: ScenarioDesignerProps) {
  const { id, readonly, description, words } = props;
  const model = useMemo(() => {
    const instance = new ScenarioDesignerModel({ id, readonly });

    return instance;
  }, [id, readonly]);

  const globalWords = useMemo(() => (words ?? NoopArray).filter(i => !!i.trim()), [words]);

  const saveTooltip = useMemo(() => {
    const desc = model.keyboardBinding.getReadableKeyBinding('save');
    return `${desc.description}(${desc.key})`;
  }, [model]);

  const awarenessUsers = useMemo(() => {
    return model.awarenessUsers.map(i => {
      if (i.id === description?.user?.id) {
        return { ...i, name: `${i.name}(你)` };
      }
      return i;
    });
  }, [model.awarenessUsers, description?.user]);

  const items = [
    {
      label: (
        <DesignerTabLabel model={model.scenarioEditorModel}>
          {ScenarioDesignerTabsMap[ScenarioDesignerTabs.Scenario]}
        </DesignerTabLabel>
      ),
      key: ScenarioDesignerTabs.Scenario,
      children: (
        <ScenarioEditor model={model.scenarioEditorModel} active={model.activeTab === ScenarioDesignerTabs.Scenario} />
      ),
    },
    {
      label: (
        <DesignerTabLabel model={model.serviceEditorModel}>
          {ScenarioDesignerTabsMap[ScenarioDesignerTabs.Service]}
        </DesignerTabLabel>
      ),
      key: ScenarioDesignerTabs.Service,
      children: (
        <DomainEditor model={model.serviceEditorModel} active={model.activeTab === ScenarioDesignerTabs.Service} />
      ),
    },
  ];

  useEffect(() => {
    if (model.error) {
      console.error(model.error);
      message.warning(model.error.message);
    }
  }, [model.error]);

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
    <ScenarioDesignerContextProvider value={model}>
      <CompletionContextProvider words={globalWords}>
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
            collaborators={awarenessUsers}
          ></DesignerHeader>
        </DesignerLayout>
      </CompletionContextProvider>
    </ScenarioDesignerContextProvider>
  );
});

export default ScenarioDesigner;
