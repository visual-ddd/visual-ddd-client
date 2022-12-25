import { EditorFormContainer, EditorFormItem, useEditorModel } from '@/lib/editor';
import { ColorInput } from '@/lib/components';
import { observer } from 'mobx-react';
import { Select } from 'antd';

import { DomainEditorModel } from '../../../model';
import { NameTooltip } from '../../constants';
import { ReferenceDSL } from '../../dsl';
import { NameInput } from '../NameInput';
import { DescriptionInput } from '../DescriptionInput';
import { TitleInput } from '../TitleInput';
import { useMemo } from 'react';
import { booleanPredicate, NoopArray } from '@wakeapp/utils';

interface CommandSelectProps {
  value?: ReferenceDSL[];
  onChange?: (value: ReferenceDSL[]) => void;
}

const CommandSelect = observer(function CommandSelect(props: CommandSelectProps) {
  const { value, onChange } = props;
  const { model } = useEditorModel<DomainEditorModel>();

  const finalValue = useMemo(() => {
    return value?.map(i => i.referenceId) ?? NoopArray;
  }, [value]);

  const handleChange = (value: string[]) => {
    const objects = value.map(i => model.domainObjectContainer.getObjectById(i)).filter(booleanPredicate);

    onChange?.(objects.map(i => ({ referenceId: i.id, name: `${i.title}(${i.name})` })));
  };

  return (
    <Select
      className="u-fw"
      placeholder="关联命令，支持多选"
      mode="multiple"
      showSearch
      optionFilterProp="children"
      value={finalValue}
      onChange={handleChange}
    >
      {model.domainObjectContainer.commands.map(i => {
        return (
          <Select.Option key={i.id} value={i.id}>
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
      <EditorFormItem path="commands" label="命令关联">
        <CommandSelect />
      </EditorFormItem>
    </EditorFormContainer>
  );
};
