import { observer } from 'mobx-react';
import { useCallback, useEffect, useMemo } from 'react';
import { Button, message, notification } from 'antd';
import { tryDispose } from '@/lib/utils';
import { IUser, VersionStatus } from '@/lib/core';
import { CompletionContextProvider } from '@/lib/components/Completion';
import { DesignerLayout, DesignerTabLabel } from '@/lib/components/DesignerLayout';
import { OfflineTip } from '@/lib/components/OfflineTip';
import {
  UbiquitousLanguageCompletionItem,
  UbiquitousLanguageCompletionProvider,
} from '@/lib/components/UbiquitousLanguageCompletion';
import { useEventBusListener, usePreventUnload } from '@/lib/hooks';
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

  /**
   * 统一语言列表
   */
  ubiquitousLanguages?: UbiquitousLanguageCompletionItem[];
}

/**
 * 领域模型设计器
 */
const DomainDesigner = observer(function DomainDesigner(props: DomainDesignerProps) {
  const { id, readonly, description, words, ubiquitousLanguages: globalUbiquitousLanguages } = props;
  const model = useMemo(() => new DomainDesignerModel({ id, readonly }), [id, readonly]);
  const [notify, notifyContextHolder] = notification.useNotification();

  const globalWords = useMemo(() => (words ?? NoopArray).filter(i => !!i.trim()), [words]);

  const ubiquitousLanguages = useCallback(() => {
    return model.ubiquitousLanguageModel.list
      .map(i => {
        return {
          id: i.englishName,
          title: i.conception,
          description: i.definition,
        } as UbiquitousLanguageCompletionItem;
      })
      .concat(globalUbiquitousLanguages ?? NoopArray);
  }, [model.ubiquitousLanguageModel, globalUbiquitousLanguages]);

  const autoCompletionWords = useCallback(() => {
    return globalWords.concat(model.ubiquitousLanguageModel.words);
  }, [globalWords, model.ubiquitousLanguageModel]);

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
      forceRender: true,
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
      forceRender: true,
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
      forceRender: true,
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
      forceRender: true,
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

  useEventBusListener(model.event, on => {
    // 对象创建成功
    on('DOMAIN_OBJECT_AUTO_GENERATED', ({ revoke }) => {
      const NOTIFICATION_KEY = 'domainGenerate';
      notify.success({
        key: NOTIFICATION_KEY,
        message: '生成成功',
        description: (
          <div>
            生成成功，可以点击下面
            <span
              className="u-link"
              onClick={() => {
                model.setActiveTab({ tab: DomainDesignerTabs.QueryModel });
              }}
            >
              查询模型
            </span>
            、
            <span
              className="u-link"
              onClick={() => {
                model.setActiveTab({ tab: DomainDesignerTabs.DataModel });
              }}
            >
              数据模型
            </span>
            、
            <span
              className="u-link"
              onClick={() => {
                model.setActiveTab({ tab: DomainDesignerTabs.Mapper });
              }}
            >
              对象结构映射
            </span>
            ，查看生成结果
            <div>
              <Button
                className="u-mt-xs"
                onClick={() => {
                  notify.destroy(NOTIFICATION_KEY);
                  revoke();
                }}
              >
                撤销
              </Button>
            </div>
          </div>
        ),
        duration: null,
      });
    });
  });

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
      <UbiquitousLanguageCompletionProvider list={ubiquitousLanguages}>
        <CompletionContextProvider words={autoCompletionWords}>
          <DesignerLayout
            items={items}
            activeKey={model.activeTab}
            onActiveKeyChange={tab => model.setActiveTab({ tab: tab as DomainDesignerTabs })}
          >
            {notifyContextHolder}
            {/* 离线提示 */}
            <OfflineTip message="你掉线了，不用当心，你操作的内容已经本地保存，请检查网络" onOnline={model.refresh} />
            <DomainDesignerLoading></DomainDesignerLoading>
            <DomainDesignerHeader
              user={description?.user}
              name={description?.name}
              version={description?.version}
              versionStatus={description?.versionStatus}
            ></DomainDesignerHeader>
          </DesignerLayout>
        </CompletionContextProvider>
      </UbiquitousLanguageCompletionProvider>
    </DomainDesignerContextProvider>
  );
});

export default DomainDesigner;
