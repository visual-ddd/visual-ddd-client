import { EditorFormCollapse, EditorFormCollapsePanel, EditorFormItem } from '@/lib/editor';
import { Input } from 'antd';

import { NameTooltip } from '../../constants';
import { PropertiesEditor } from '../PropertiesEditor';
import { MethodsEditor } from '../MethodsEditor';
import { NameInput } from '../NameInput';
import { DescriptionInput } from '../DescriptionInput';

const DEFAULT_ACTIVE = ['base', 'properties', 'methods'];

export const EntityEditor = () => {
  return (
    <EditorFormCollapse defaultActiveKey={DEFAULT_ACTIVE}>
      <EditorFormCollapsePanel header="基础信息" key="base">
        <EditorFormItem path="name" label="标识符" tooltip={NameTooltip['CamelCase']}>
          <NameInput nameCase="CamelCase" dbclickToEnable />
        </EditorFormItem>
        <EditorFormItem path="title" label="标题">
          <Input placeholder="使用统一语言起个标题" />
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
