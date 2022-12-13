import { createContext, useContext } from 'react';
import { BaseEditorStore } from './BaseEditorStore';

const CONTEXT = createContext<BaseEditorStore | null>(null);
CONTEXT.displayName = 'EditorStoreContext';

export const EditorStoreProvider = CONTEXT.Provider;

export function useEditorStore<Store extends BaseEditorStore = BaseEditorStore>() {
  return useContext(CONTEXT) as Store | null;
}
