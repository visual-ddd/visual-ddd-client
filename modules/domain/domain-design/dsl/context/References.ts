import { createContext, useContext } from 'react';

export interface IReference {
  /**
   * 引用 ID
   */
  value: string;

  /**
   * 引用标题
   */
  label: string;
}

export interface ReferencesContextValue {
  references: IReference[];
}

/**
 * 引用类型提供者
 */
const context = createContext<ReferencesContextValue | null>(null);
context.displayName = 'ReferencesContext';

export function useReferencesContext() {
  return useContext(context);
}

export const ReferencesContextProvider = context.Provider;
