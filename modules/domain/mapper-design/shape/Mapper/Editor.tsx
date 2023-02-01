import { EditorFormCollapse, EditorFormCollapsePanel, EditorFormItem, useEditorModel } from '@/lib/editor';
import { DescriptionInput } from '@/modules/domain/domain-design/dsl/components/DescriptionInput';
import { ObjectNameInput } from '@/modules/domain/domain-design/dsl/components/ObjectNameInput';
import { TitleInput } from '@/modules/domain/domain-design/dsl/components/TitleInput';
import { NameTooltip } from '@/modules/domain/domain-design/dsl/constants';
import { MapperEditorModel } from '../../model';
import { MappersList } from './MappersList';
import { ObjectSelect } from './ObjectSelect';

const DEFAULT_ACTIVE = ['base', 'mappers'];

export const MapperObjectEditor = () => {
  const { model } = useEditorModel<MapperEditorModel>();
  return (
    <EditorFormCollapse defaultActiveKey={DEFAULT_ACTIVE}>
      <EditorFormCollapsePanel header="基础信息" key="base">
        <EditorFormItem
          path="name"
          label="标识符"
          tooltip={
            <>
              <div>- {NameTooltip['CamelCase']}</div>
              <div>- 不能同其他映射冲突</div>
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
        <EditorFormItem path="source" label="来源">
          <ObjectSelect datasource={() => model.mapperStore.sourceObjectGroups} />
        </EditorFormItem>
        <EditorFormItem path="target" label="目标">
          <ObjectSelect datasource={() => model.mapperStore.targetObjectGroup} />
        </EditorFormItem>
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="字段映射" key="mappers" path="mappers">
        <MappersList />
      </EditorFormCollapsePanel>
    </EditorFormCollapse>
  );
};
