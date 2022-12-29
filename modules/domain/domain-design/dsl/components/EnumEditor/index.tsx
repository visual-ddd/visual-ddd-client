import { EditorFormCollapse, EditorFormCollapsePanel, EditorFormItem } from '@/lib/editor';

import { NameTooltip } from '../../constants';
import { DescriptionInput } from '../DescriptionInput';
import { TitleInput } from '../TitleInput';
import { ObjectNameInput } from '../ObjectNameInput';
import { Select } from 'antd';
import { EnumMembersEditor } from '../EnumMembersEditor';

const DEFAULT_ACTIVE = ['base', 'members', 'methods'];

export const EnumEditor = () => {
  return (
    <EditorFormCollapse defaultActiveKey={DEFAULT_ACTIVE}>
      <EditorFormCollapsePanel header="基础信息" key="base">
        <EditorFormItem path="name" label="标识符" tooltip={NameTooltip['SNAKE_CASE']}>
          <ObjectNameInput />
        </EditorFormItem>
        <EditorFormItem path="title" label="标题">
          <TitleInput />
        </EditorFormItem>
        <EditorFormItem path="description" label="描述">
          <DescriptionInput />
        </EditorFormItem>
        <EditorFormItem path="baseType" label="成员类型">
          <Select className="u-fw">
            <Select.Option value="number">number</Select.Option>
            <Select.Option value="string">string</Select.Option>
          </Select>
        </EditorFormItem>
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="成员" key="members">
        <EnumMembersEditor />
      </EditorFormCollapsePanel>
    </EditorFormCollapse>
  );
};
