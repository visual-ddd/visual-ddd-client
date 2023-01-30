import { useEffect, useMemo } from 'react';
import { useCompletionContext } from './CompletionContext';
import {
  CompletionImplement,
  CompletionImplementIdentifierLowerCamelCase,
  CompletionImplementIdentifierLowerSnakeCase,
  CompletionImplementIdentifierUpperCamelCase,
  CompletionImplementIdentifierUpperSnakeCase,
} from './CompletionImplement';

// TODO: 优化，这些实例全局只需要一个就够了
export function useIdentifierCompletion(wordCase: 'CamelCase' | 'camelCase' | 'SNAKE_CASE' | 'snake_case') {
  const context = useCompletionContext();

  const instance = useMemo(() => {
    switch (wordCase) {
      case 'CamelCase':
        return new CompletionImplementIdentifierUpperCamelCase();
      case 'camelCase':
        return new CompletionImplementIdentifierLowerCamelCase();
      case 'SNAKE_CASE':
        return new CompletionImplementIdentifierUpperSnakeCase();
      case 'snake_case':
        return new CompletionImplementIdentifierLowerSnakeCase();
    }
  }, [wordCase]);

  useEffect(() => {
    instance.setCandidate(context.identifiers);
  }, [instance, context.identifiers]);

  return (value: string) => instance.search(value);
}

export function useCompletion() {
  const context = useCompletionContext();

  const instance = useMemo(() => {
    return new CompletionImplement();
  }, []);

  useEffect(() => {
    instance.setCandidate(context.words);
  }, [instance, context.words]);

  return (value: string) => instance.search(value);
}
