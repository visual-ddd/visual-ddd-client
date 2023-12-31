import { useEditorFormContext, EditorFormItem } from '@/lib/editor';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { Switch } from 'antd';

import { ParameterDSL } from '../../dsl';
import { NameTooltip } from '../../constants';
import { createParameter } from '../../factory';
import { MemberList } from '../MemberList';
import { DescriptionInput } from '../DescriptionInput';

import s from './index.module.scss';
import { NameInput } from '../NameInput';
import { reactifyParameter } from '../../reactify';
import { ReferenceTypeProvider, TypeInput } from '../TypeInput';
import { TitleInput } from '../TitleInput';
import { replaceLastPathToPattern } from '@/lib/utils';

export interface ParameterEditorProps {
  /**
   * 基础路径
   */
  path: string;
}

type Item = ParameterDSL;

const ITEM_STYLE = { width: '250px' };

const renderItem = (value: Item, index: number) => {
  const { title } = value;
  return (
    <div className={classNames('vd-parameters-editor-item', s.item)} title={title}>
      {reactifyParameter(value, index)}
    </div>
  );
};

const renderEditor = (path: string) => {
  const p = (cp: string) => `${path}.${cp}`;
  return (
    <>
      <EditorFormItem
        path={p('name')}
        label="标识符"
        tooltip={NameTooltip['camelCase']}
        notify={replaceLastPathToPattern(path) + '.name'}
      >
        <NameInput nameCase="camelCase" style={ITEM_STYLE} />
      </EditorFormItem>
      <EditorFormItem path={p('title')} label="标题">
        <TitleInput />
      </EditorFormItem>
      <EditorFormItem path={p('description')} label="描述">
        <DescriptionInput />
      </EditorFormItem>
      {/* 实体、值对象方法签名支持所有引用类型  */}
      <ReferenceTypeProvider>
        <EditorFormItem path={p('type')} label="类型">
          <TypeInput />
        </EditorFormItem>
      </ReferenceTypeProvider>
      <EditorFormItem
        path={p('optional')}
        label="可空类型？"
        valuePropName="checked"
        tooltip="表示该字段可能为 null, 比如我们在代码生成时会加上 @Nullable"
      >
        <Switch></Switch>
      </EditorFormItem>
    </>
  );
};

/**
 * 方法参数编辑器
 */
export const ParameterEditor = observer(function ParameterEditor(props: ParameterEditorProps) {
  const { path: basePath } = props;
  const { formModel } = useEditorFormContext()!;
  const path = (basePath ? basePath + '.' : '') + 'parameters';
  const value = formModel.getProperty(path);
  const handleChange = (list: Item[]) => {
    formModel.setProperty(path, list);
  };

  const factory = (): Item => {
    const item = createParameter();
    item.name += value.length;

    return item;
  };

  return (
    <MemberList
      className="vd-parameters-editor"
      showError
      path={path}
      value={value}
      onChange={handleChange}
      factory={factory}
      addText="添加参数"
      editorDisplayType="popover"
      renderItem={renderItem}
      renderEditor={renderEditor}
      editorTitle="参数编辑"
    />
  );
});
