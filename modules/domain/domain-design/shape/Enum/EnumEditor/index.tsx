import { EditorFormCollapse, EditorFormCollapsePanel, EditorFormItem } from '@/lib/editor';

import { NameTooltip } from '../../../dsl/constants';
import { DescriptionInput } from '../../../dsl/components/DescriptionInput';
import { TitleInput } from '../../../dsl/components/TitleInput';
import { ObjectNameInput } from '../../../dsl/components/ObjectNameInput';
import { Select } from 'antd';
import { EnumMembersEditor } from './EnumMembersEditor';

const DEFAULT_ACTIVE = ['base', 'members'];

export const EnumEditor = () => {
  return (
    <EditorFormCollapse defaultActiveKey={DEFAULT_ACTIVE}>
      <EditorFormCollapsePanel header="基础信息" key="base">
        <EditorFormItem
          path="name"
          label="标识符"
          tooltip={
            <>
              <div> - {NameTooltip['SNAKE_CASE']}</div>
              <div>- 同一个聚合下，不能和其他实体、值对象、枚举冲突</div>
              <div>
                - 谨慎变更，可以<b>双击进行编辑</b>
              </div>
            </>
          }
        >
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
      <EditorFormCollapsePanel header="成员" key="members" path="members">
        <EnumMembersEditor />
      </EditorFormCollapsePanel>
    </EditorFormCollapse>
  );
};
