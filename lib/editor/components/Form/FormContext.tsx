import { createContext, useContext } from 'react';
import { FormModel } from '../../Model';

export interface EditorFormContext {
  /**
   * 表单模型
   */
  formModel: FormModel;

  /**
   * 只读状态
   */
  readonly: boolean;
}

const Context = createContext<EditorFormContext | null>(null);
Context.displayName = 'EditorFormContext';

export function useEditorFormContext() {
  return useContext(Context);
}

export const EditorFormContextProvider = Context.Provider;
