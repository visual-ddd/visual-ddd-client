import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import lowerFirst from 'lodash/lowerFirst';
import snakeCase from 'lodash/snakeCase';
import { NameCase } from '@/lib/core';

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
