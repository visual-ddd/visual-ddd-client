import { NameCase } from '@/lib/core';
import { CompletionImplement } from './CompletionImplement';

export interface CompletionContextValue {
  /**
   * 所有单词
   */
  words: string[];

  /**
   * 有效的标识符
   */
  identifiers: string[];

  getCompletion: (key: NameCase | 'any') => CompletionImplement;
}
