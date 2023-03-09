import { EditorFormCollapse, EditorFormCollapsePanel, EditorFormItem } from '@/lib/editor';
import { useDynamicSlot } from '@/lib/components/DynamicSlot';

import { NameTooltip } from '../../../dsl/constants';
import { PropertiesEditor } from '../../../dsl/components/PropertiesEditor';
import { MethodsEditor } from '../../../dsl/components/MethodsEditor';
import { DescriptionInput } from '../../../dsl/components/DescriptionInput';
import { TitleInput } from '../../../dsl/components/TitleInput';
import { ObjectNameInput } from '../../../dsl/components/ObjectNameInput';
import { useAutoCompleteUbiquitousLanguageFromFormModel } from '../../../hooks';

const DEFAULT_ACTIVE = ['base', 'properties', 'methods'];

export const ValueObjectEditor = () => {
  const propertiesActionSlot = useDynamicSlot();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleMatchUbiquitousLanguage = useAutoCompleteUbiquitousLanguageFromFormModel({ path: '' });

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
          <ObjectNameInput onMatchUbiquitousLanguage={handleMatchUbiquitousLanguage} />
        </EditorFormItem>
        <EditorFormItem path="title" label="标题" tooltip="用统一语言来描述">
          <TitleInput />
        </EditorFormItem>
        <EditorFormItem path="description" label="描述">
          <DescriptionInput />
        </EditorFormItem>
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="属性" key="properties" path="properties" extra={propertiesActionSlot.content}>
        <PropertiesEditor actionSlot={propertiesActionSlot.render} />
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="方法" key="methods" path="methods">
        <MethodsEditor />
      </EditorFormCollapsePanel>
    </EditorFormCollapse>
  );
};
