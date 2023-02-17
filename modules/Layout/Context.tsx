import { Noop } from '@wakeapp/utils';
import { createContext, useContext, useEffect } from 'react';

export interface LayoutContextValue {
  setTitle(title: React.ReactNode): void;
}

const CONTEXT = createContext<LayoutContextValue>({ setTitle: Noop });
CONTEXT.displayName = 'LayoutContext';

export function useLayoutContext() {
  return useContext(CONTEXT);
}

/**
 * 设置标题
 * @param title
 * @returns
 */
export function useLayoutTitle(title: string) {
  const { setTitle } = useLayoutContext();
  return useEffect(() => {
    if (title) {
      setTitle(title);
    }
  }, [title, setTitle]);
}

export const LayoutContextProvider = CONTEXT.Provider;
