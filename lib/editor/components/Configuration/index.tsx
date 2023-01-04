import { createContext, useContext } from 'react';
import { BaseNode } from '../../Model';

export interface EditorConfigurationValue {
  /**
   * 标题渲染
   * @param node
   * @returns
   */
  renderTitle?: (node: BaseNode) => React.ReactNode;
}

const CONTEXT = createContext<EditorConfigurationValue>({});
CONTEXT.displayName = 'EditorConfiguration';

export function useEditorConfiguration() {
  return useContext(CONTEXT);
}

export const EditorConfigurationProvider = CONTEXT.Provider;
