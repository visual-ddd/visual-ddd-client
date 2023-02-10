import {
  EditorFormContainer,
  EditorFormItem,
  EditorFormItemStatic,
  useEditorFormContext,
  useEditorModel,
} from '@/lib/editor';
import { ColorInput } from '@/lib/components/ColorInput';
import { observer, useLocalObservable } from 'mobx-react';
import { Select } from 'antd';
import diff from 'lodash/difference';

import { DomainEditorModel, DomainObjectAggregation, DomainObjectCommand } from '../../../model';
import { NameTooltip } from '../../constants';
import { DescriptionInput } from '../DescriptionInput';
import { TitleInput } from '../TitleInput';
import { ObjectNameInput } from '../ObjectNameInput';

interface CommandSelectProps {}

const CommandSelect = observer(function CommandSelect(props: CommandSelectProps) {
  const { formModel } = useEditorFormContext()!;
  const { model } = useEditorModel<DomainEditorModel>();
  const aggregation = model.domainObjectStore.getObjectById(formModel.id) as DomainObjectAggregation;

  const store = useLocalObservable(() => ({
    get value() {
      return aggregation.commands.map(i => i.id);
    },
  }));

  const handleChange = (value: string[]) => {
    const removed = diff(store.value, value);

    model.domainObjectStore.toObjects<DomainObjectCommand>(removed).map(i => {
      i.setAggregation({ aggregation: undefined });
    });

    model.domainObjectStore.toObjects<DomainObjectCommand>(value).map(i => {
      i.setAggregation({ aggregation });
    });
  };

  return (
    <Select
      className="u-fw"
      placeholder="关联命令，支持多选"
      mode="multiple"
      showSearch
      optionFilterProp="children"
      value={store.value}
      onChange={handleChange}
    >
      {model.domainObjectStore.commands.map(i => {
        return (
          <Select.Option key={i.id} value={i.id} disabled={i.aggregation && i.aggregation !== aggregation}>
            {i.title}({i.name})
          </Select.Option>
        );
      })}
    </Select>
  );
});

export const AggregationEditor = () => {
  return (
    <EditorFormContainer>
      <EditorFormItem path="name" label="标识符" tooltip={NameTooltip['CamelCase']}>
        <ObjectNameInput />
      </EditorFormItem>
      <EditorFormItem path="title" label="标题">
        <TitleInput />
      </EditorFormItem>
      <EditorFormItem path="description" label="描述">
        <DescriptionInput />
      </EditorFormItem>
      <EditorFormItem path="color" label="颜色标注">
        <ColorInput />
      </EditorFormItem>
      <EditorFormItemStatic label="命令关联">
        <CommandSelect />
      </EditorFormItemStatic>
    </EditorFormContainer>
  );
};
