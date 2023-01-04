import { useEditorFormContext, EditorFormItem } from '@/lib/editor';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { Input } from 'antd';

import { EnumMemberDSL, PropertyDSL } from '../../dsl';
import { NameTooltip } from '../../constants';
import { createEnumMember } from '../../factory';
import { MemberList } from '../MemberList';
import { NameInput } from '../NameInput';

import s from './index.module.scss';
import { DescriptionInput } from '../DescriptionInput';
import { reactifyEnumMember } from '../../reactify';
import { TitleInput } from '../TitleInput';

export interface EnumMembersEditorProps {
  /**
   * 属性列表的路径， 默认是 members
   */
  path?: string;
}

const renderItem = (value: EnumMemberDSL) => {
  return <div className={classNames('vd-enum-members-editor-item', s.item)}>{reactifyEnumMember(value)}</div>;
};

const renderEditor = (path: string) => {
  const p = (cp: string) => `${path}.${cp}`;
  return (
    <>
      <EditorFormItem path={p('name')} label="标识符" tooltip={NameTooltip['SNAKE_CASE']}>
        <NameInput nameCase="SNAKE_CASE" />
      </EditorFormItem>
      <EditorFormItem path={p('title')} label="标题">
        <TitleInput />
      </EditorFormItem>
      <EditorFormItem path={p('description')} label="描述">
        <DescriptionInput />
      </EditorFormItem>
      <EditorFormItem path={p('code')} label="编码" onBeforeChange={(v: string | undefined) => v && v.trim()}>
        <Input placeholder="请输入编码" />
      </EditorFormItem>
    </>
  );
};

/**
 * 属性编辑器
 */
export const EnumMembersEditor = observer(function EnumMembersEditor(props: EnumMembersEditorProps) {
  const { path = 'members' } = props;
  const { formModel } = useEditorFormContext()!;
  const members = formModel.getProperty(path);
  const baseType = formModel.getProperty('baseType');

  const handleChange = (list: PropertyDSL[]) => {
    formModel.setProperty(path, list);
  };

  const factory = (): EnumMemberDSL => {
    const item = createEnumMember(baseType);
    item.name += members.length;

    return item;
  };

  return (
    <MemberList
      className="vd-enum-members-editor"
      path={path}
      showError
      value={members}
      onChange={handleChange}
      factory={factory}
      addText="添加成员"
      editorDisplayType="portal"
      renderItem={renderItem}
      renderEditor={renderEditor}
      editorTitle="成员编辑"
    />
  );
});