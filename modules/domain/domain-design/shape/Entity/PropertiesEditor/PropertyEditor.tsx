import { EditorFormItem, EditorFormPortal } from '@/lib/editor';
import { Input } from 'antd';
import { observer } from 'mobx-react';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { IDDSL } from '../../../dsl';
import { AccessSelect } from '../../../dsl/components';

export interface PropertyEditorProps<T extends IDDSL = any> {
  path: string;
  list: T[];
}

export interface PropertyEditorMethods<T extends IDDSL = any> {
  show: (item: T) => void;
  hide: () => void;
}

export function usePropertyEditorRef<T extends IDDSL = any>() {
  return useRef<PropertyEditorMethods<T>>(null);
}

export const PropertyEditor = observer(
  forwardRef<PropertyEditorMethods, PropertyEditorProps>(function PropertyEditor(props, ref) {
    const { path, list } = props;
    const [currentEditing, setCurrentEditing] = useState<IDDSL>();
    const [visible, setVisible] = useState(false);
    const idx = useMemo(() => {
      return currentEditing == null
        ? -1
        : list.findIndex(i => {
            return i.uuid === currentEditing.uuid;
          });
    }, [list, currentEditing]);
    const basePath = idx !== -1 ? `${path}[${idx}]` : '';
    const finalVisible = !!(visible && basePath);

    useImperativeHandle(
      ref,
      () => {
        return {
          hide() {
            setVisible(false);
          },
          show(item) {
            setCurrentEditing(item);
            setVisible(true);
          },
        };
      },
      []
    );

    const p = (cp: string) => `${basePath}.${cp}`;

    return (
      <EditorFormPortal title="属性编辑" value={finalVisible} onChange={setVisible}>
        <EditorFormItem path={p('name')} label="标识符">
          <Input />
        </EditorFormItem>
        <EditorFormItem path={p('title')} label="标题">
          <Input />
        </EditorFormItem>
        <EditorFormItem path={p('description')} label="描述">
          <Input.TextArea />
        </EditorFormItem>
        <EditorFormItem path={p('type')} label="类型">
          <Input />
        </EditorFormItem>
        <EditorFormItem path={p('access')} label="访问控制">
          <AccessSelect />
        </EditorFormItem>
      </EditorFormPortal>
    );
  })
);
