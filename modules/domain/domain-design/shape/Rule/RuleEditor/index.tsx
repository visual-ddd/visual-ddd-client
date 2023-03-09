import { EditorFormContainer, EditorFormItem } from '@/lib/editor';

import { NameTooltip } from '../../../dsl/constants';
import { DescriptionInput } from '../../../dsl/components/DescriptionInput';
import { TitleInput } from '../../../dsl/components/TitleInput';
import { CommandOrQuerySelect } from '../../../dsl/components/CommandOrQuerySelect';
import { ObjectNameInput } from '../../../dsl/components/ObjectNameInput';
import { useAutoCompleteUbiquitousLanguageFromFormModel } from '../../../hooks';

export const RuleEditor = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleMatchUbiquitousLanguage = useAutoCompleteUbiquitousLanguageFromFormModel({ path: '' });

  return (
    <EditorFormContainer>
      <EditorFormItem path="name" label="标识符" tooltip={NameTooltip['CamelCase']}>
        <ObjectNameInput onMatchUbiquitousLanguage={handleMatchUbiquitousLanguage} />
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
