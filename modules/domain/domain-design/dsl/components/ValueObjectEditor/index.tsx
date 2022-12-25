import { EditorFormCollapse, EditorFormCollapsePanel, EditorFormItem } from '@/lib/editor';

import { NameTooltip } from '../../constants';
import { PropertiesEditor } from '../PropertiesEditor';
import { MethodsEditor } from '../MethodsEditor';
import { NameInput } from '../NameInput';
import { DescriptionInput } from '../DescriptionInput';
import { TitleInput } from '../TitleInput';

const DEFAULT_ACTIVE = ['base', 'properties', 'methods'];

export const ValueObjectEditor = () => {
  return (
    <EditorFormCollapse defaultActiveKey={DEFAULT_ACTIVE}>
      <EditorFormCollapsePanel header="基础信息" key="base">
        <EditorFormItem path="name" label="标识符" tooltip={NameTooltip['CamelCase']}>
          <NameInput nameCase="CamelCase" dbclickToEnable />
        </EditorFormItem>
        <EditorFormItem path="title" label="标题">
          <TitleInput />
        </EditorFormItem>
        <EditorFormItem path="description" label="描述">
          <DescriptionInput />
        </EditorFormItem>
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="属性" key="properties">
        <PropertiesEditor />
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="方法" key="methods">
        <MethodsEditor />
      </EditorFormCollapsePanel>
    </EditorFormCollapse>
  );
};