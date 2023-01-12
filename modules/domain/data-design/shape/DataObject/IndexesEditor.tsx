import { useEditorFormContext, EditorFormItem, EditorFormConsumer } from '@/lib/editor';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { Select } from 'antd';

import { NameTooltip } from '@/modules/domain/domain-design/dsl/constants';
import { NameInput } from '@/modules/domain/domain-design/dsl/components/NameInput';
import { TitleInput } from '@/modules/domain/domain-design/dsl/components/TitleInput';
import { DescriptionInput } from '@/modules/domain/domain-design/dsl/components/DescriptionInput';
import { MemberList } from '@/modules/domain/domain-design/dsl/components/MemberList';

import {
  createDataObjectIndexDSL,
  DataObjectDSL,
  DataObjectIndexDSL,
  DataObjectIndexListList,
  DataObjectIndexMethodList,
  DataObjectPropertyDSL,
} from '../../dsl';
import { reactifyIndex, reactifyProperty } from './reactify';
import { replaceLastPathToPattern } from '@/lib/utils';

export interface IndexesEditorProps {
  /**
   * 索引列表的路径， 默认是 indexes
   */
  path?: string;
}

const renderItem = (value: DataObjectIndexDSL) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { formModel } = useEditorFormContext()!;

  return (
    <div className={classNames('vd-data-properties-editor-item')}>
      {reactifyIndex(formModel.properties as unknown as DataObjectDSL, value)}
    </div>
  );
};

const renderEditor = (path: string) => {
  const p = (cp: string) => `${path}.${cp}`;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { formModel } = useEditorFormContext()!;

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

      <EditorFormItem path={p('type')} label="索引类型">
        <Select className="u-fw" placeholder="选择索引类型">
          {DataObjectIndexListList.map(i => {
            return (
              <Select.Option key={i.name} value={i.name}>
                {i.label}
              </Select.Option>
            );
          })}
        </Select>
      </EditorFormItem>

      <EditorFormItem path={p('method')} label="索引方法">
        <Select className="u-fw" placeholder="选择索引方法">
          {DataObjectIndexMethodList.map(i => {
            return (
              <Select.Option key={i.name} value={i.name}>
                {i.label}
              </Select.Option>
            );
          })}
        </Select>
      </EditorFormItem>
      <EditorFormConsumer<DataObjectPropertyDSL[]> path="properties">
        {({ value }) => {
          return (
            <EditorFormItem path={p('properties')} label="索引属性" tooltip="支持多选">
              <Select className="u-fw" placeholder="选择索引属性" allowClear mode="multiple">
                {value.map(i => {
                  return (
                    <Select.Option key={i.uuid} value={i.uuid}>
                      {reactifyProperty(formModel.properties as unknown as DataObjectDSL, i)}
                    </Select.Option>
                  );
                })}
              </Select>
            </EditorFormItem>
          );
        }}
      </EditorFormConsumer>
    </>
  );
};

/**
 * 索引编辑器
 */
export const IndexesEditor = observer(function IndexesEditor(props: IndexesEditorProps) {
  const { path = 'indexes' } = props;
  const { formModel } = useEditorFormContext()!;
  const indexes = formModel.getProperty(path);

  const handleChange = (list: DataObjectIndexDSL[]) => {
    formModel.setProperty(path, list);
  };

  const factory = (): DataObjectIndexDSL => {
    const item = createDataObjectIndexDSL();
    item.name += indexes.length;

    return item;
  };

  return (
    <MemberList
      className="vd-data-indexes-editor"
      path={path}
      showError
      value={indexes}
      onChange={handleChange}
      factory={factory}
      addText="添加索引"
      editorDisplayType="portal"
      renderItem={renderItem}
      renderEditor={renderEditor}
      editorTitle="索引编辑"
    />
  );
});
