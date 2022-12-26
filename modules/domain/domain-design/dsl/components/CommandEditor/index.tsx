import {
  EditorFormCollapse,
  EditorFormCollapsePanel,
  EditorFormItem,
  EditorFormItemStatic,
  useEditorFormContext,
  useEditorModel,
} from '@/lib/editor';
import { observer, useLocalObservable } from 'mobx-react';
import { Select } from 'antd';
import diff from 'lodash/difference';

import type { DomainEditorModel, DomainObjectCommand, DomainObjectRule } from '../../../model';

import { NameTooltip } from '../../constants';

import { PropertiesEditor } from '../PropertiesEditor';
import { NameInput } from '../NameInput';
import { DescriptionInput } from '../DescriptionInput';
import { TitleInput } from '../TitleInput';
import { SourceInput } from '../SourceInput';
import { TypeInput } from '../TypeInput';
import { AggregationSelect } from '../AggregationSelect';

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
      i.setAssociation({ association: undefined });
    });

    model.domainObjectStore.toObjects<DomainObjectRule>(value).map(i => {
      i.setAssociation({ association: command });
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
          <Select.Option key={i.id} value={i.id} disabled={i.association && i.association !== command}>
            {i.title}({i.name})
          </Select.Option>
        );
      })}
    </Select>
  );
});

export const CommandEditor = () => {
  return (
    <EditorFormCollapse defaultActiveKey={DEFAULT_ACTIVE}>
      <EditorFormCollapsePanel header="基础信息" key="base">
        <EditorFormItem path="name" label="标识符" tooltip={NameTooltip['CamelCase']}>
          <NameInput nameCase="CamelCase" dbclickToEnable />
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
        <EditorFormItem path="source" label="触发来源">
          <SourceInput />
        </EditorFormItem>
        <EditorFormItem path="result" label="返回值">
          <TypeInput isMethodResult />
        </EditorFormItem>
        <EditorFormItemStatic label="规则关联">
          <RulesSelect />
        </EditorFormItemStatic>
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="属性" key="properties">
        <PropertiesEditor />
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="事件属性" key="eventProperties">
        <PropertiesEditor path="eventProperties" />
      </EditorFormCollapsePanel>
    </EditorFormCollapse>
  );
};
