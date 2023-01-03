import { EditorFormCollapse, EditorFormCollapsePanel, EditorFormItem } from '@/lib/editor';

import { NameTooltip } from '../../constants';
import { PropertiesEditor } from '../PropertiesEditor';
import { MethodsEditor } from '../MethodsEditor';
import { DescriptionInput } from '../DescriptionInput';
import { TitleInput } from '../TitleInput';
import { ObjectNameInput } from '../ObjectNameInput';

const DEFAULT_ACTIVE = ['base', 'properties', 'methods'];

export const ValueObjectEditor = () => {
  return (
    <EditorFormCollapse defaultActiveKey={DEFAULT_ACTIVE}>
      <EditorFormCollapsePanel header="基础信息" key="base">
        <EditorFormItem
          path="name"
          label="标识符"
          tooltip={
            <>
              <div>- {NameTooltip['CamelCase']}</div>
              <div>- 同一个聚合下，不能和其他实体、值对象、枚举冲突</div>
              <div>
                - 谨慎变更，可以<b>双击进行编辑</b>
              </div>
            </>
          }
        >
          <ObjectNameInput />
        </EditorFormItem>
        <EditorFormItem path="title" label="标题" tooltip="用统一语言来描述">
          <TitleInput />
        </EditorFormItem>
        <EditorFormItem path="description" label="描述">
          <DescriptionInput />
        </EditorFormItem>
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="属性" key="properties" path="properties">
        <PropertiesEditor />
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="方法" key="methods" path="methods">
        <MethodsEditor />
      </EditorFormCollapsePanel>
    </EditorFormCollapse>
  );
};
