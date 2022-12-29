import { EditorFormContainer, EditorFormItem } from '@/lib/editor';

import { NameTooltip } from '../../constants';
import { DescriptionInput } from '../DescriptionInput';
import { TitleInput } from '../TitleInput';
import { CommandSelect } from '../CommandSelect';
import { ObjectNameInput } from '../ObjectNameInput';

export const RuleEditor = () => {
  return (
    <EditorFormContainer>
      <EditorFormItem path="name" label="标识符" tooltip={NameTooltip['CamelCase']}>
        <ObjectNameInput />
      </EditorFormItem>
      <EditorFormItem path="title" label="规则标题">
        <TitleInput />
      </EditorFormItem>
      <EditorFormItem path="description" label="规则描述">
        <DescriptionInput />
      </EditorFormItem>
      <EditorFormItem path="aggregator" label="关联命令">
        <CommandSelect />
      </EditorFormItem>
    </EditorFormContainer>
  );
};
