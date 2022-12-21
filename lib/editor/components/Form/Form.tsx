import { observer } from 'mobx-react';
import { ReactNode, useMemo } from 'react';
import { BaseNode, useEditorModel } from '../../Model';
import { EditorFormContext, EditorFormContextProvider } from './FormContext';
import { ConfigProvider } from 'antd';

export interface EditorFormProps {
  node: BaseNode;

  children?: ReactNode;
}

export const EditorForm = observer(function EditorForm(props: EditorFormProps) {
  const { node, children } = props;
  const { formStore } = useEditorModel();

  const formModel = formStore.getFormModel(node)!;
  const context = useMemo<EditorFormContext>(() => {
    return { formModel };
  }, [formModel]);

  return (
    <EditorFormContextProvider value={context}>
      <ConfigProvider
        // TODO: 只读模式
        // componentDisabled={}
        componentSize="small"
      >
        {children}
      </ConfigProvider>
    </EditorFormContextProvider>
  );
});
