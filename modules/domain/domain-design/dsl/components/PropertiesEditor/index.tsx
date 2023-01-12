import { useEditorFormContext, EditorFormItem } from '@/lib/editor';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { NameDSL, PropertyDSL } from '../../dsl';
import { NameTooltip } from '../../constants';
import { createProperty } from '../../factory';
import { AccessSelect } from '../AccessSelect';
import { MemberList } from '../MemberList';
import { NameInput } from '../NameInput';

import s from './index.module.scss';
import { DescriptionInput } from '../DescriptionInput';
import { reactifyProperty } from '../../reactify';
import { ReferenceTypeProvider, ReferenceTypeProviderProps, TypeInput } from '../TypeInput';
import { TitleInput } from '../TitleInput';
import { DomainObject, DomainObjectFactory } from '../../../model';
import { replaceLastPathToPattern } from '@/lib/utils';

export interface PropertiesEditorProps {
  /**
   * 属性列表的路径， 默认是 properties
   */
  path?: string;

  /**
   * 引用类型过滤器，默认只过滤掉 command
   */
  referenceTypeFilter?: ReferenceTypeProviderProps['filter'];
}

const renderItem = (value: PropertyDSL) => {
  return <div className={classNames('vd-properties-editor-item', s.item)}>{reactifyProperty(value)}</div>;
};

const omitCommand = (i: DomainObject<NameDSL>) => {
  return !DomainObjectFactory.isCommand(i);
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
        <NameInput nameCase="camelCase" />
      </EditorFormItem>
      <EditorFormItem path={p('title')} label="标题">
        <TitleInput />
      </EditorFormItem>
      <EditorFormItem path={p('description')} label="描述">
        <DescriptionInput />
      </EditorFormItem>
      <EditorFormItem path={p('type')} label="类型">
        <TypeInput />
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
  const { path = 'properties', referenceTypeFilter = omitCommand } = props;
  const { formModel } = useEditorFormContext()!;
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
    <ReferenceTypeProvider filter={referenceTypeFilter}>
      <MemberList
        className="vd-properties-editor"
        path={path}
        showError
        value={properties}
        onChange={handleChange}
        factory={factory}
        addText="添加属性"
        editorDisplayType="portal"
        renderItem={renderItem}
        renderEditor={renderEditor}
        editorTitle="属性编辑"
      />
    </ReferenceTypeProvider>
  );
});
