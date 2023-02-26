import { NameCase } from '@/lib/core';
import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import {
  CompletionImplement,
  CompletionImplementIdentifierLowerCamelCase,
  CompletionImplementIdentifierLowerSnakeCase,
  CompletionImplementIdentifierUpperCamelCase,
  CompletionImplementIdentifierUpperSnakeCase,
} from './CompletionImplement';
import { CompletionContextValue } from './type';
import { extraIdentifiersFromWords } from './utils';

const CONTEXT = createContext<CompletionContextValue | null>(null);
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
  const completionImplements = useRef<Map<NameCase | 'any', CompletionImplement> | undefined>();

  const value = useMemo<CompletionContextValue>(() => {
    const identifiers = extraIdentifiersFromWords(words);

    const getCompletion = (key: NameCase | 'any') => {
      if (completionImplements.current == null) {
        completionImplements.current = new Map();
      }

      const comp = completionImplements.current.get(key);

      if (comp != null) {
        return comp;
      }

      let instance: CompletionImplement;

      switch (key) {
        case 'CamelCase':
          instance = new CompletionImplementIdentifierUpperCamelCase();
          break;
        case 'camelCase':
          instance = new CompletionImplementIdentifierLowerCamelCase();
          break;
        case 'SNAKE_CASE':
          instance = new CompletionImplementIdentifierUpperSnakeCase();
          break;
        case 'snake_case':
          instance = new CompletionImplementIdentifierLowerSnakeCase();
          break;
        default:
          instance = new CompletionImplement();
          break;
      }

      if (key === 'any') {
        instance.setCandidate(words);
      } else {
        instance.setCandidate(identifiers);
      }

      completionImplements.current.set(key, instance);

      return instance;
    };

    return { words, identifiers, getCompletion };
  }, [words]);

  // 更新獲選
  useEffect(() => {
    if (!completionImplements.current) {
      return;
    }

    for (const [key, implement] of completionImplements.current) {
      if (!implement) {
        continue;
      }

      if (key === 'any') {
        implement.setCandidate(value.words);
      } else {
        implement.setCandidate(value.identifiers);
      }
    }
  }, [value]);

  return <CONTEXT.Provider value={value}>{children}</CONTEXT.Provider>;
};
