import { EditorFormConsumer, EditorFormItem, useEditorModel } from '@/lib/editor';
import { Select } from 'antd';
import { observer } from 'mobx-react';
import { DataObjectReferenceCardinality } from '../../dsl';

import { DataObjectEditorModel } from '../../model';
import { reactifyProperty } from './reactify';

export interface ReferenceEditorProps {
  path: string;
}

/**
 * 引用类型编辑器
 */
export const ReferenceEditor = observer(function ReferenceEditor(props: ReferenceEditorProps) {
  const { path } = props;
  const { model } = useEditorModel<DataObjectEditorModel>();
  const store = model.dataObjectStore;

  const p = (cp: string) => `${path}.${cp}`;

  return (
    <>
      <EditorFormItem path={p('target')} label="引用对象" required>
        <Select className="u-fw" placeholder="选择引用对象">
          {store.objectsInArray.map(i => {
            return (
              <Select.Option key={i.id} value={i.id}>
                {i.readableTitle}
              </Select.Option>
            );
          })}
        </Select>
      </EditorFormItem>

      <EditorFormConsumer<string | undefined> path={p('target')}>
        {({ value }) => {
          const object = value ? store.getObjectById(value) : undefined;

          if (!object) {
            return <></>;
          }

          return (
            <EditorFormItem path={p('targetProperty')} label="引用字段" required>
              <Select className="u-fw" placeholder="选择字段">
                {object.referableProperties.map(i => {
                  return (
                    <Select.Option key={i.uuid} value={i.uuid}>
                      {reactifyProperty(object.dsl, i)}
                    </Select.Option>
                  );
                })}
              </Select>
            </EditorFormItem>
          );
        }}
      </EditorFormConsumer>

      <EditorFormItem path={p('cardinality')} label="引用基数">
        <Select className="u-fw" placeholder="选择引用基数" allowClear>
          <Select.Option value={DataObjectReferenceCardinality.OneToOne}>一对一</Select.Option>
          <Select.Option value={DataObjectReferenceCardinality.OneToMany}>一对多</Select.Option>
          <Select.Option value={DataObjectReferenceCardinality.ManyToOne}>多对一</Select.Option>
          <Select.Option value={DataObjectReferenceCardinality.ManyToMany}>多对多</Select.Option>
        </Select>
      </EditorFormItem>
    </>
  );
});
