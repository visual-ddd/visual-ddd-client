import {
  EditorFormContainer,
  EditorFormItem,
  EditorFormItemStatic,
  useEditorFormContext,
  useEditorModel,
} from '@/lib/editor';
import { ColorInput } from '@/lib/components';
import { observer, useLocalObservable } from 'mobx-react';
import { Select } from 'antd';
import diff from 'lodash/difference';

import { DomainEditorModel } from '../../../model';
import { NameTooltip } from '../../constants';
import { NameInput } from '../NameInput';
import { DescriptionInput } from '../DescriptionInput';
import { TitleInput } from '../TitleInput';
import { DomainObjectAggregation } from '../../../model/DomainObjectAggregation';
import { DomainObjectCommand } from '../../../model/DomainObjectCommand';

interface CommandSelectProps {}

const CommandSelect = observer(function CommandSelect(props: CommandSelectProps) {
  const { formModel } = useEditorFormContext()!;
  const { model } = useEditorModel<DomainEditorModel>();
  const aggregation = model.domainObjectContainer.getObjectById(formModel.id) as DomainObjectAggregation;

  const store = useLocalObservable(() => ({
    get value() {
      return aggregation.commands.map(i => i.id);
    },
  }));

  const handleChange = (value: string[]) => {
    const removed = diff(store.value, value);

    model.domainObjectContainer.toObjects<DomainObjectCommand>(removed).map(i => {
      i.setAggregation({ aggregation: undefined });
    });

    model.domainObjectContainer.toObjects<DomainObjectCommand>(value).map(i => {
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
      {model.domainObjectContainer.commands.map(i => {
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
        <NameInput nameCase="CamelCase" dbclickToEnable />
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
