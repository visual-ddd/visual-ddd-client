import { NameCase } from '@/lib/core';
import { useCompletionContext } from './CompletionContext';

export function useIdentifierCompletion(wordCase: NameCase) {
  const context = useCompletionContext();

  return (value: string) => context!.getCompletion(wordCase).search(value);
}

export function useCompletion() {
  const context = useCompletionContext();

  return (value: string) => context!.getCompletion('any').search(value);
}
