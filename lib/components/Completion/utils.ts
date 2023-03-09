import memoize from 'lodash/memoize';
import words from 'lodash/words';

export const isIdentifier = memoize((word: string) => {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(word);
});

/**
 * 提取标识符
 */
export const extraIdentifier = memoize((word: string): string | undefined => {
  // 分词
  // 将 ' 替换为 空字符串，比如 don't 转换为 dont
  const splittedWords = words(word.replace(/['\u2019]/g, ''));
  const identifiers = splittedWords.filter(i => !!i && isIdentifier(i)).map(i => i.toLowerCase());

  if (identifiers.length) {
    return identifiers.join('-');
  }
});

/**
 * 从单词中提取标识符
 * @param words
 * @returns
 */
export function extraIdentifiersFromWords(words: string[]): string[] {
  const identifiers: Set<string> = new Set();

  for (const word of words) {
    const id = extraIdentifier(word);
    if (id) {
      identifiers.add(id);
    }
  }

  return Array.from(identifiers);
}

export function extraUpperCamelCaseFilter(value: string) {
  for (let i = value.length - 1; i >= 0; i--) {
    const char = value[i];
    if (char === '_' || char === '$') {
      return value.slice(i + 1);
    }

    if (/[A-Z]/.test(char)) {
      return value.slice(i);
    }
  }

  return value;
}
