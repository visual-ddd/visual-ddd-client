import { EditorFormCollapse, EditorFormCollapsePanel, EditorFormItem } from '@/lib/editor';
import { useDynamicSlot } from '@/lib/components/DynamicSlot';

import { DomainObjectFactory } from '../../../model';
import { NameTooltip } from '../../../dsl/constants';
import { PropertiesEditor } from '../../../dsl/components/PropertiesEditor';
import { DescriptionInput } from '../../../dsl/components/DescriptionInput';
import { TitleInput } from '../../../dsl/components/TitleInput';
import { ObjectNameInput } from '../../../dsl/components/ObjectNameInput';

const DEFAULT_ACTIVE = ['base', 'properties'];

export const DTOEditor = () => {
  const propertiesActionSlot = useDynamicSlot();

  return (
    <EditorFormCollapse defaultActiveKey={DEFAULT_ACTIVE}>
      <EditorFormCollapsePanel header="基础信息" key="base">
        <EditorFormItem
          path="name"
          label="标识符"
          tooltip={
            <>
              <div>- {NameTooltip['CamelCase']}</div>
              <div>- 不能和其他 DTO 冲突</div>
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
      <EditorFormCollapsePanel header="属性" extra={propertiesActionSlot.content} key="properties" path="properties">
        <PropertiesEditor actionSlot={propertiesActionSlot.render} referenceTypeFilter={DomainObjectFactory.isDTO} />
      </EditorFormCollapsePanel>
    </EditorFormCollapse>
  );
};
