import { NameCase } from '../../dsl';

export function makeSet(chars: string) {
  return new Set<string>(Array.from(chars));
}

const letters = makeSet('abcdefghijklmnopqrstuvwxyz');
const numbers = makeSet('1234567890');
const punctuations = makeSet('$_');

const starts = new Set([...letters, ...punctuations]);
const all = new Set([...letters, ...punctuations, ...numbers]);

function isLowerCase(c: string) {
  return c.charCodeAt(0) > 90;
}

function isUpperCase(c: string) {
  return c.charCodeAt(0) <= 90;
}

export function allow(c: string, currentValue: string, nameCase: NameCase) {
  const isStart = !currentValue;
  const lowC = c.toLowerCase();
  const isLetter = letters.has(lowC);

  if (isStart) {
    if (!starts.has(lowC)) {
      return false;
    }

    switch (nameCase) {
      case 'camelCase': {
        if (isLetter && !isLowerCase(c)) {
          return false;
        }
        break;
      }
      default: {
        if (isLetter && !isUpperCase(c)) {
          return false;
        }

        break;
      }
    }
  }

  const isAllowChar = all.has(lowC);

  if (isAllowChar && nameCase === 'SNAKE_CASE' && isLetter && isLowerCase(c)) {
    return false;
  }

  return isAllowChar;
}
