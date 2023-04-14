import camelCase from 'camelcase';
import upperFirst from 'lodash/upperFirst';
import lowerFirst from 'lodash/lowerFirst';
import snakeCase from 'lodash/snakeCase';
import memoize from 'lodash/memoize';
import { NameCase } from '@/lib/core';

/**
 * 是否所有字符都是大写的
 * @param value
 * @returns
 */
export function isAllUpper(value: string) {
  return value === value.toUpperCase();
}

/**
 * 将不规范的驼峰命名进行规范化
 * @param value
 * @param pascalCase
 * @returns
 */
export const normalizedCamelCase = memoize(
  (value: string, pascalCase?: boolean): string => {
    let result = camelCase(value, { preserveConsecutiveUppercase: true, pascalCase });

    if (!pascalCase) {
      // 将前缀的所有大写字母转换为小写
      result = result.replace(/^([A-Z]+)(.?)/, (match, g1, g2) => {
        if (!g2) {
          return match.toLowerCase();
        }

        if (g1.length > 1) {
          return g1.slice(0, -1).toLowerCase() + g1.slice(-1) + g2;
        }

        return g1.toLowerCase() + g2;
      });
    }

    return result;
  },
  (value, pascalCase) => `${value}-${pascalCase}`
);

/**
 * case 之间的相互转换会有一些歧义。如果是规范化驼峰命名，建议使用 normalizedCamelCase
 * @param nameCase
 * @param value
 * @returns
 */
export function toNameCase(nameCase: NameCase, value: string): string {
  switch (nameCase) {
    case 'CamelCase':
      return upperFirst(camelCase(value));
    case 'camelCase':
      return lowerFirst(camelCase(value));
    case 'SNAKE_CASE':
      return snakeCase(value).toUpperCase();
    case 'snake_case':
      return snakeCase(value).toLowerCase();
  }
}
