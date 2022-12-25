import { EditorFormCollapse, EditorFormCollapsePanel, EditorFormItem } from '@/lib/editor';

import { NameTooltip } from '../../constants';
import { PropertiesEditor } from '../PropertiesEditor';
import { NameInput } from '../NameInput';
import { DescriptionInput } from '../DescriptionInput';
import { TitleInput } from '../TitleInput';
import { SourceInput } from '../SourceInput';
import { TypeInput } from '../TypeInput';

const DEFAULT_ACTIVE = ['base', 'properties', 'eventProperties'];

export const CommandEditor = () => {
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
        <EditorFormItem path="source" label="触发来源">
          <SourceInput />
        </EditorFormItem>
        <EditorFormItem path="result" label="返回值">
          <TypeInput isMethodResult />
        </EditorFormItem>
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="属性" key="properties">
        <PropertiesEditor />
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="事件属性" key="eventProperties">
        <PropertiesEditor path="eventProperties" />
      </EditorFormCollapsePanel>
    </EditorFormCollapse>
  );
};
