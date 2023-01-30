import memoize from 'lodash/memoize';

export const isIdentifier = memoize((word: string) => {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(word);
});

/**
 * 提取标识符
 */
export const extraIdentifier = memoize((word: string) => {
  return word
    .split(/[^0-9a-z]+/i)
    .map(i => i.trim())
    .filter(i => {
      return !!i && isIdentifier(i);
    });
});

export function extraIdentifiersFromWords(words: string[]): string[] {
  const identifiers: string[] = [];

  for (const word of words) {
    identifiers.push(...extraIdentifier(word));
  }

  return identifiers;
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
