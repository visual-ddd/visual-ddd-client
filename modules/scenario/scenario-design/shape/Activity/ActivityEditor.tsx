import { EditorFormContainer, EditorFormItem } from '@/lib/editor';
import { TitleInput } from '@/lib/components/TitleInput';
import { DescriptionInput } from '@/lib/components/DescriptionInput';

export const ActivityEditor = () => {
  return (
    <EditorFormContainer>
      <EditorFormItem path="title" label="名称">
        <TitleInput />
      </EditorFormItem>
      <EditorFormItem path="description" label="描述">
        <DescriptionInput />
      </EditorFormItem>
      TODO: 绑定
    </EditorFormContainer>
  );
};
