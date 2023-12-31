import {
  EditorFormCollapse,
  EditorFormCollapsePanel,
  EditorFormItem,
  EditorFormItemStatic,
  useEditorFormContext,
  useEditorModel,
} from '@/lib/editor';
import { observer, useLocalObservable } from 'mobx-react';
import { Select, Switch } from 'antd';
import diff from 'lodash/difference';
import { useDynamicSlot } from '@/lib/components/DynamicSlot';

import type { DomainEditorModel, DomainObjectCommand, DomainObjectRule } from '../../../model';

import { NameTooltip } from '../../../dsl/constants';

import { PropertiesEditor } from '../../../dsl/components/PropertiesEditor';
import { DescriptionInput } from '../../../dsl/components/DescriptionInput';
import { TitleInput } from '../../../dsl/components/TitleInput';
import { SourceInput } from '../../../dsl/components/SourceInput';
import { TypeInput } from '../../../dsl/components/TypeInput';
import { AggregationSelect } from '../../../dsl/components/AggregationSelect';
import { ObjectNameInput } from '../../../dsl/components/ObjectNameInput';
import { NameInput } from '../../../dsl/components/NameInput';
import { useAutoCompleteUbiquitousLanguageFromFormModel } from '../../../hooks';

const DEFAULT_ACTIVE = ['base', 'properties', 'eventProperties'];

const RulesSelect = observer(function RulesSelect() {
  const { formModel } = useEditorFormContext()!;
  const { model } = useEditorModel<DomainEditorModel>();
  const command = model.domainObjectStore.getObjectById(formModel.id) as DomainObjectCommand;

  const store = useLocalObservable(() => ({
    get value() {
      return command.rules.map(i => i.id);
    },
  }));

  const handleChange = (value: string[]) => {
    const removed = diff(store.value, value);

    model.domainObjectStore.toObjects<DomainObjectRule>(removed).map(i => {
      i.setAggregator({ aggregator: undefined });
    });

    model.domainObjectStore.toObjects<DomainObjectRule>(value).map(i => {
      i.setAggregator({ aggregator: command });
    });
  };

  return (
    <Select
      className="u-fw"
      placeholder="关联规则，支持多选"
      mode="multiple"
      showSearch
      optionFilterProp="children"
      value={store.value}
      onChange={handleChange}
    >
      {model.domainObjectStore.rules.map(i => {
        return (
          <Select.Option key={i.id} value={i.id} disabled={i.aggregator && i.aggregator.id !== command.id}>
            {i.title}({i.name})
          </Select.Option>
        );
      })}
    </Select>
  );
});

export const CommandEditor = () => {
  const propertiesActionSlot = useDynamicSlot();
  const eventPropertiesActionSlot = useDynamicSlot();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleMatchUbiquitousLanguage = useAutoCompleteUbiquitousLanguageFromFormModel({ path: '' });

  return (
    <EditorFormCollapse defaultActiveKey={DEFAULT_ACTIVE}>
      <EditorFormCollapsePanel header="基础信息" key="base">
        <EditorFormItem path="name" label="标识符" tooltip={NameTooltip['CamelCase']}>
          <ObjectNameInput onMatchUbiquitousLanguage={handleMatchUbiquitousLanguage} />
        </EditorFormItem>
        <EditorFormItem path="title" label="标题">
          <TitleInput />
        </EditorFormItem>
        <EditorFormItem path="description" label="描述">
          <DescriptionInput />
        </EditorFormItem>
        <EditorFormItem path="aggregation" label="所属聚合">
          <AggregationSelect />
        </EditorFormItem>
        <EditorFormItem
          path="category"
          label="分类"
          tooltip={
            <>
              <div>命令分类，会影响命令的包文件组织，默认为命令标识符，建议使用精简的单词描述</div>
              <i>双击编辑</i>
            </>
          }
        >
          <NameInput nameCase="camelCase" dbclickToEnable />
        </EditorFormItem>
        <EditorFormItem path="source" label="触发来源">
          <SourceInput />
        </EditorFormItem>
        <EditorFormItem path="eventSendable" label="事件发送" valuePropName="checked">
          <Switch />
        </EditorFormItem>
        <EditorFormItem path="repository" label="仓储绑定">
          <Select placeholder="绑定仓储能力" className="u-fw">
            <Select.Option value="create">新增</Select.Option>
            <Select.Option value="modify">更新</Select.Option>
            <Select.Option value="remove">删除</Select.Option>
          </Select>
        </EditorFormItem>
        <EditorFormItem path="result" label="返回值">
          <TypeInput isMethodResult />
        </EditorFormItem>
        <EditorFormItemStatic label="规则关联">
          <RulesSelect />
        </EditorFormItemStatic>
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="属性" extra={propertiesActionSlot.content} key="properties" path="properties">
        <PropertiesEditor actionSlot={propertiesActionSlot.render} />
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel
        header="事件属性"
        key="eventProperties"
        path="eventProperties"
        tooltip="事件默认会继承命令的属性"
        extra={eventPropertiesActionSlot.content}
      >
        <PropertiesEditor path="eventProperties" actionSlot={eventPropertiesActionSlot.render} />
      </EditorFormCollapsePanel>
    </EditorFormCollapse>
  );
};
