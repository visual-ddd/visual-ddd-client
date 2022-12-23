import { observer } from 'mobx-react';
import { FormModel } from '../../Model';
import { useEditorFormContext } from './FormContext';

export interface EditorFormConsumerProps<T> {
  path: string;

  children: (scope: { value: T; onChange: (value: T) => void; formModel: FormModel }) => React.ReactElement;
}

export const EditorFormConsumer = observer(function EditorFormConsumer<T>(props: EditorFormConsumerProps<T>) {
  const { path, children } = props;
  const { formModel } = useEditorFormContext()!;

  const value = formModel.getProperty(path);
  const onChange = (value: T) => {
    formModel.setProperty(path, value);
  };

  return children({ value, onChange, formModel });
});
