import { createContext, useContext, useMemo } from 'react';
import { CompletionContextValue } from './type';
import { extraIdentifiersFromWords } from './utils';

const CONTEXT = createContext<CompletionContextValue>({ words: [], identifiers: [] });
CONTEXT.displayName = 'CompletionContext';

export function useCompletionContext() {
  return useContext(CONTEXT);
}

export interface CompletionContextProviderProps {
  /**
   * 所有单词
   */
  words: string[];

  children: React.ReactNode;
}

/**
 * 推断来源上下文
 * @param props
 * @returns
 */
export const CompletionContextProvider = (props: CompletionContextProviderProps) => {
  const { words, children } = props;

  const value = useMemo<CompletionContextValue>(() => {
    return { words, identifiers: extraIdentifiersFromWords(words) };
  }, [words]);

  return <CONTEXT.Provider value={value}>{children}</CONTEXT.Provider>;
};
