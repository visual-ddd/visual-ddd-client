import { EditorFormContainer, EditorFormItem } from '@/lib/editor';

import { NameTooltip } from '../../../dsl/constants';
import { DescriptionInput } from '../../../dsl/components/DescriptionInput';
import { TitleInput } from '../../../dsl/components/TitleInput';
import { CommandOrQuerySelect } from '../../../dsl/components/CommandOrQuerySelect';
import { ObjectNameInput } from '../../../dsl/components/ObjectNameInput';

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
      <EditorFormItem path="aggregator" label="关联">
        <CommandOrQuerySelect />
      </EditorFormItem>
    </EditorFormContainer>
  );
};
