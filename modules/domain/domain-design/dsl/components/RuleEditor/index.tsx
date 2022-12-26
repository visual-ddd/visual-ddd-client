import { EditorFormContainer, EditorFormItem } from '@/lib/editor';

import { NameTooltip } from '../../constants';
import { NameInput } from '../NameInput';
import { DescriptionInput } from '../DescriptionInput';
import { TitleInput } from '../TitleInput';

export const RuleEditor = () => {
  return (
    <EditorFormContainer>
      <EditorFormItem path="name" label="标识符" tooltip={NameTooltip['CamelCase']}>
        <NameInput nameCase="CamelCase" dbclickToEnable />
      </EditorFormItem>
      <EditorFormItem path="title" label="规则标题">
        <TitleInput />
      </EditorFormItem>
      <EditorFormItem path="description" label="规则描述">
        <DescriptionInput />
      </EditorFormItem>
    </EditorFormContainer>
  );
};
