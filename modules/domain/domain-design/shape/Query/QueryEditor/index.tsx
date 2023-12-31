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

import { DomainEditorModel, DomainObjectFactory, DomainObjectQuery, DomainObjectRule } from '../../../model';

import { NameTooltip } from '../../../dsl/constants';

import { PropertiesEditor } from '../../../dsl/components/PropertiesEditor';
import { DescriptionInput } from '../../../dsl/components/DescriptionInput';
import { TitleInput } from '../../../dsl/components/TitleInput';
import { SourceInput } from '../../../dsl/components/SourceInput';
import { ReferenceTypeProvider, TypeInput } from '../../../dsl/components/TypeInput';
import { ObjectNameInput } from '../../../dsl/components/ObjectNameInput';
import { useAutoCompleteUbiquitousLanguageFromFormModel } from '../../../hooks';

const DEFAULT_ACTIVE = ['base', 'properties', 'eventProperties'];

const RulesSelect = observer(function RulesSelect() {
  const { formModel } = useEditorFormContext()!;
  const { model } = useEditorModel<DomainEditorModel>();
  const query = model.domainObjectStore.getObjectById(formModel.id) as DomainObjectQuery;

  const store = useLocalObservable(() => ({
    get value() {
      return query.rules.map(i => i.id);
    },
  }));

  const handleChange = (value: string[]) => {
    const removed = diff(store.value, value);

    model.domainObjectStore.toObjects<DomainObjectRule>(removed).map(i => {
      i.setAggregator({ aggregator: undefined });
    });

    model.domainObjectStore.toObjects<DomainObjectRule>(value).map(i => {
      i.setAggregator({ aggregator: query });
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
          <Select.Option key={i.id} value={i.id} disabled={i.aggregator && i.aggregator.id !== query.id}>
            {i.title}({i.name})
          </Select.Option>
        );
      })}
    </Select>
  );
});

export const QueryEditor = () => {
  const propertiesActionSlot = useDynamicSlot();

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
        <EditorFormItem path="source" label="触发来源">
          <SourceInput allows={['http', 'rpc']} />
        </EditorFormItem>
        <ReferenceTypeProvider filter={DomainObjectFactory.isDTO}>
          <EditorFormItem path="result" label="返回值">
            <TypeInput isMethodResult />
          </EditorFormItem>
        </ReferenceTypeProvider>
        <EditorFormItem path="pagination" valuePropName="checked" label="分页返回值">
          <Switch></Switch>
        </EditorFormItem>
        <EditorFormItemStatic label="规则关联">
          <RulesSelect />
        </EditorFormItemStatic>
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="属性" key="properties" path="properties" extra={propertiesActionSlot.content}>
        <PropertiesEditor actionSlot={propertiesActionSlot.render} referenceTypeFilter={DomainObjectFactory.isDTO} />
      </EditorFormCollapsePanel>
    </EditorFormCollapse>
  );
};
