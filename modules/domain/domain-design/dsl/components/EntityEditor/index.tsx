import { EditorFormCollapse, EditorFormCollapsePanel, EditorFormConsumer, EditorFormItem } from '@/lib/editor';
import { Select, SelectProps, Switch } from 'antd';
import { observer } from 'mobx-react';

import { NameTooltip, UntitledInCamelCase, UntitledInHumanReadable } from '../../constants';
import { PropertiesEditor } from '../PropertiesEditor';
import { MethodsEditor } from '../MethodsEditor';
import { NameInput } from '../NameInput';
import { DescriptionInput } from '../DescriptionInput';
import { PropertyDSL } from '../../dsl';
import { TitleInput } from '../TitleInput';

const DEFAULT_ACTIVE = ['base', 'properties', 'methods'];

interface IDSelectorProps extends SelectProps {}

const IDSelector = observer(function IDSelector(props: IDSelectorProps) {
  return (
    <EditorFormConsumer<PropertyDSL[]> path="properties">
      {({ value }) => {
        return (
          <Select className="u-fw" placeholder="请选择属性" {...props}>
            {value.map(i => {
              return (
                <Select.Option key={i.uuid} value={i.uuid}>
                  {i.name ?? UntitledInCamelCase}({i.title ?? UntitledInHumanReadable})
                </Select.Option>
              );
            })}
          </Select>
        );
      }}
    </EditorFormConsumer>
  );
});

export const EntityEditor = () => {
  return (
    <EditorFormCollapse defaultActiveKey={DEFAULT_ACTIVE}>
      <EditorFormCollapsePanel header="基础信息" key="base">
        <EditorFormItem
          path="name"
          label="标识符"
          tooltip={
            <>
              <div>- {NameTooltip['CamelCase']}</div>
              <div>- 同一个聚合下，不能和其他实体、值对象冲突</div>
              <div>
                - 谨慎变更，可以<b>双击进行编辑</b>
              </div>
            </>
          }
        >
          <NameInput nameCase="CamelCase" dbclickToEnable />
        </EditorFormItem>
        <EditorFormItem path="title" label="标题" tooltip="用统一语言来描述">
          <TitleInput />
        </EditorFormItem>
        <EditorFormItem path="description" label="描述">
          <DescriptionInput />
        </EditorFormItem>
        <EditorFormItem
          valuePropName="checked"
          path="isAggregationRoot"
          label="是否为聚合根"
          tooltip="一个聚合内只能有一个聚合根"
        >
          <Switch />
        </EditorFormItem>
        <EditorFormItem
          path="id"
          label="ID"
          tooltip="实体的唯一标识符属性"
          dependencies="properties"
          dependenciesTriggerWhenTouched={false}
        >
          <IDSelector />
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
