import { useEditorFormContext, EditorFormItem } from '@/lib/editor';
import { Input } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { PropertyDSL } from '../../dsl';
import { VoidClass, UntitledInCamelCase, AccessModifier, NameTooltip } from '../../constants';
import { createProperty } from '../../factory';
import { AccessSelect } from '../AccessSelect';
import { MemberList } from '../MemberList';
import { NameInput } from '../NameInput';

import s from './index.module.scss';
import { DescriptionInput } from '../DescriptionInput';

export interface PropertiesEditorProps {}

const renderItem = (value: PropertyDSL) => {
  const { access, type, title, name } = value;
  return (
    <div className={classNames('vd-properties-editor-item', s.item)}>
      <span className={classNames('vd-properties-editor-item__access', s.itemAccess)}>
        {AccessModifier[access || 'public']}
      </span>
      <span className={classNames('vd-properties-editor-item__name', s.itemName)} title={title}>
        <span className="u-bold">{name || UntitledInCamelCase}</span>: {type || VoidClass}
      </span>
    </div>
  );
};

const renderEditor = (path: string) => {
  const p = (cp: string) => `${path}.${cp}`;
  return (
    <>
      <EditorFormItem path={p('name')} label="标识符" tooltip={NameTooltip['camelCase']}>
        <NameInput nameCase="camelCase" />
      </EditorFormItem>
      <EditorFormItem path={p('title')} label="标题">
        <Input />
      </EditorFormItem>
      <EditorFormItem path={p('description')} label="描述">
        <DescriptionInput />
      </EditorFormItem>
      <EditorFormItem path={p('type')} label="类型">
        <Input />
      </EditorFormItem>
      <EditorFormItem path={p('access')} label="访问控制">
        <AccessSelect />
      </EditorFormItem>
    </>
  );
};

/**
 * 属性编辑器
 */
export const PropertiesEditor = observer(function PropertiesEditor(props: PropertiesEditorProps) {
  const { formModel } = useEditorFormContext()!;
  const path = 'properties';
  const properties = formModel.getProperty(path);
  const handleChange = (list: PropertyDSL[]) => {
    formModel.setProperty(path, list);
  };

  const factory = (): PropertyDSL => {
    const item = createProperty();
    item.name += properties.length;

    return item;
  };

  return (
    <MemberList
      className="vd-properties-editor"
      path={path}
      value={properties}
      onChange={handleChange}
      factory={factory}
      addText="添加属性"
      editorDisplayType="portal"
      renderItem={renderItem}
      renderEditor={renderEditor}
      editorTitle="属性编辑"
    />
  );
});
