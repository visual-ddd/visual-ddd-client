import { useEditorFormContext, EditorFormItem } from '@/lib/editor';
import { Input, Switch } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { MethodDSL } from '../../dsl';
import { UntitledInCamelCase, AccessModifier, Void, VoidClass } from '../../constants';
import { createMethod } from '../../factory';
import { AccessSelect } from '../AccessSelect';
import { MemberList } from '../MemberList';

import s from './index.module.scss';
import { ParameterEditor } from '../ParameterEditor';

export interface MethodsEditorProps {}
type Item = MethodDSL;

const renderItem = (value: Item) => {
  const { access = 'public', result = Void, title, parameters, name = UntitledInCamelCase } = value;
  return (
    <div className={classNames('vd-methods-editor-item', s.item)}>
      <span className={classNames('vd-methods-editor-item__access', s.itemAccess)}>{AccessModifier[access]}</span>
      <span className={classNames('vd-methods-editor-item__name', s.itemName)} title={title}>
        <span className="u-bold">{name}</span>(
        {parameters
          .map((i, idx) => {
            return `${i.name || 'arg' + idx}: ${i.type || VoidClass}`;
          })
          .join(', ')}
        ): {result}
      </span>
    </div>
  );
};

const renderEditor = (path: string) => {
  const p = (cp: string) => `${path}.${cp}`;
  return (
    <>
      <EditorFormItem path={p('name')} label="标识符">
        <Input />
      </EditorFormItem>
      <EditorFormItem path={p('title')} label="标题">
        <Input />
      </EditorFormItem>
      <EditorFormItem path={p('description')} label="描述">
        <Input.TextArea />
      </EditorFormItem>
      <EditorFormItem path={p('access')} label="访问控制">
        <AccessSelect />
      </EditorFormItem>
      <EditorFormItem path={p('abstract')} label="抽象方法" valuePropName="checked">
        <Switch />
      </EditorFormItem>
      <EditorFormItem path={p('parameters')} label="参数">
        <ParameterEditor path={path} />
      </EditorFormItem>
      <EditorFormItem path={p('result')} label="返回值类型">
        <Input />
      </EditorFormItem>
    </>
  );
};

/**
 * 方法编辑器
 */
export const MethodsEditor = observer(function MethodsEditor(props: MethodsEditorProps) {
  const { formModel } = useEditorFormContext()!;
  const path = 'methods';
  const properties = formModel.getProperty(path);
  const handleChange = (list: Item[]) => {
    formModel.setProperty(path, list);
  };

  const factory = (): Item => {
    const item = createMethod();
    item.name += properties.length;

    return item;
  };

  return (
    <MemberList
      className="vd-methods-editor"
      path={path}
      value={properties}
      onChange={handleChange}
      factory={factory}
      addText="添加方法"
      editorDisplayType="portal"
      renderItem={renderItem}
      renderEditor={renderEditor}
      editorTitle="方法编辑"
    />
  );
});
