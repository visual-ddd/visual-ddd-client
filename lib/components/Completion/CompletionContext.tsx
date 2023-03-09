import { NameCase } from '@/lib/core';
import { NoopArray } from '@wakeapp/utils';
import { reaction } from 'mobx';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
   * 所有单词, 注意
   * - 这个应该是不可变的, 这个函数变化会触发重新监听
   * - 这个函数应该是 observable
   */
  words: () => string[];

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
  const [list, setList] = useState<string[]>(NoopArray);

  const value = useMemo<CompletionContextValue>(() => {
    const identifiers = extraIdentifiersFromWords(list);

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
        instance.setCandidate(list);
      } else {
        instance.setCandidate(identifiers);
      }

      completionImplements.current.set(key, instance);

      return instance;
    };

    return { words: list, identifiers, getCompletion };
  }, [list]);

  // 更新候选
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

  useEffect(() => {
    return reaction(
      words,
      results => {
        setList(results ?? NoopArray);
      },
      {
        requiresObservable: true,
        name: 'WATCH_COMPLETION_WORDS',
        fireImmediately: true,
        // 不需要实时刷新
        delay: 2000,
      }
    );
  }, [words]);

  return <CONTEXT.Provider value={value}>{children}</CONTEXT.Provider>;
};
