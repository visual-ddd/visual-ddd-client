import type { NameCase } from '@/lib/core';

export function makeSet(chars: string) {
  return new Set<string>(Array.from(chars));
}

const letters = makeSet('abcdefghijklmnopqrstuvwxyz');
const numbers = makeSet('1234567890');
const punctuations = makeSet('$_');

const validStarts = new Set([...letters, ...punctuations]);
const all = new Set([...letters, ...punctuations, ...numbers]);

function isLowerCase(c: string) {
  return c.charCodeAt(0) > 90;
}

function isUpperCase(c: string) {
  return c.charCodeAt(0) <= 90;
}

export function allow(c: string, currentValue: string, nameCase: NameCase): string {
  const isStart = !currentValue;
  const lowC = c.toLowerCase();
  const isLetter = letters.has(lowC);

  if (isStart) {
    if (!validStarts.has(lowC)) {
      return '';
    }

    switch (nameCase) {
      case 'camelCase':
      case 'snake_case': {
        if (isLetter && !isLowerCase(c)) {
          return c.toLowerCase();
        }
        break;
      }
      default: {
        if (isLetter && !isUpperCase(c)) {
          return c.toUpperCase();
        }

        break;
      }
    }
  }

  const isAllowChar = all.has(lowC);

  if (isAllowChar) {
    if (nameCase === 'SNAKE_CASE' && isLetter && isLowerCase(c)) {
      // 仅支持大写
      return c.toUpperCase();
    } else if (nameCase === 'snake_case' && isLetter && isUpperCase(c)) {
      // 仅支持小写
      return c.toLowerCase();
    }

    return c;
  }

  return '';
}

/**
 * 值转换
 * @param value
 */
export function valueTransform(value: string, nameCase: NameCase) {
  let currentValue = '';

  for (const char of value) {
    currentValue += allow(char, currentValue, nameCase);
  }

  return currentValue;
}
