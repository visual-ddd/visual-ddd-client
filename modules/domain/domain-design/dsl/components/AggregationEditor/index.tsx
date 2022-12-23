import { EditorFormContainer, EditorFormItem } from '@/lib/editor';
import { ColorInput } from '@/lib/components';

import { NameTooltip } from '../../constants';
import { NameInput } from '../NameInput';
import { DescriptionInput } from '../DescriptionInput';
import { TitleInput } from '../TitleInput';

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
    </EditorFormContainer>
  );
};
