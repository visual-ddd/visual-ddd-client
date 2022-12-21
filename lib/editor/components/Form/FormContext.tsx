import { createContext, useContext } from 'react';
import { FormModel } from '../../Model';

export interface EditorFormContext {
  formModel: FormModel;
  // TODO: 只读状态
  // disabled: boolean;
}

const Context = createContext<EditorFormContext | null>(null);
Context.displayName = 'EditorFormContext';

export function useEditorFormContext() {
  return useContext(Context);
}

export const EditorFormContextProvider = Context.Provider;
