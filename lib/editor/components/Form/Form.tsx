import { observer } from 'mobx-react';
import { ReactNode, useMemo } from 'react';
import { BaseNode, useEditorModel } from '../../Model';
import { EditorFormContext, EditorFormContextProvider } from './FormContext';
import { ConfigProvider } from 'antd';

export interface EditorFormProps {
  node: BaseNode;

  /**
   * 是否为只读模式
   */
  readonly?: boolean;

  children?: ReactNode;
}

export const EditorForm = observer(function EditorForm(props: EditorFormProps) {
  const { node, readonly, children } = props;
  const { formStore, model } = useEditorModel();

  const formModel = formStore.getFormModel(node)!;
  const context = useMemo<EditorFormContext>(() => {
    return { formModel, readonly: model.readonly };
  }, [formModel, model]);

  return (
    <EditorFormContextProvider value={context}>
      <ConfigProvider componentDisabled={readonly} componentSize="small">
        {children}
      </ConfigProvider>
    </EditorFormContextProvider>
  );
});
