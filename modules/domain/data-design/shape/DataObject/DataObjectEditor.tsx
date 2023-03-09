import { EditorFormCollapse, EditorFormCollapsePanel, EditorFormConsumer, EditorFormItem } from '@/lib/editor';
import snakeCase from 'lodash/snakeCase';
import { observer } from 'mobx-react';

import { DescriptionInput } from '@/modules/domain/domain-design/dsl/components/DescriptionInput';
import { ObjectNameInput } from '@/modules/domain/domain-design/dsl/components/ObjectNameInput';
import { TitleInput } from '@/modules/domain/domain-design/dsl/components/TitleInput';
import { NameTooltip, UntitledInUpperCamelCase } from '@/modules/domain/domain-design/dsl/constants';
import { NameInput } from '@/modules/domain/domain-design/dsl';
import { useDynamicSlot } from '@/lib/components/DynamicSlot';
import { PropertiesEditor } from './PropertiesEditor';
import { IndexesEditor } from './IndexesEditor';
import { useAutoCompleteUbiquitousLanguageFromFormModel } from '@/modules/domain/domain-design/hooks/useAutoCompleteUbiquitousLanguageFromFormModel';

const DEFAULT_ACTIVE = ['base', 'properties', 'indexes'];

export const DataObjectEditor = observer(function DataObjectEditor() {
  const propertiesSlot = useDynamicSlot();
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
              <div>- 不能同其他数据对象冲突</div>
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
        <EditorFormConsumer<string> path="name">
          {value => {
            return (
              <EditorFormItem
                path="tableName"
                label="表名"
                tooltip={
                  <>
                    <div>- {NameTooltip['snake_case']}</div>
                    <div>- 数据库表名，默认为标识符的 snake_case 模式</div>
                    <div>- 谨慎修改，双击进行编辑</div>
                  </>
                }
              >
                <NameInput
                  dbclickToEnable
                  nameCase="snake_case"
                  placeholder={`表名，默认为 ${snakeCase(value.value || UntitledInUpperCamelCase)}`}
                />
              </EditorFormItem>
            );
          }}
        </EditorFormConsumer>
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="属性" key="properties" path="properties" extra={propertiesSlot.content}>
        <PropertiesEditor actionSlot={propertiesSlot.render} />
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="索引" key="indexes" path="indexes">
        <IndexesEditor />
      </EditorFormCollapsePanel>
    </EditorFormCollapse>
  );
});
