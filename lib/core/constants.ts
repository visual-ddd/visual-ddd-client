import { NameCase } from './types';

export const NameTooltip: Record<NameCase, string> = {
  CamelCase: '输入大写驼峰式(CamelCase)标识符，需要符合编程语言规范, 不能包含除数字、字符、$、_ 之外的字符',
  camelCase: '输入小写驼峰式(camelCase)标识符，需要符合编程语言规范, 不能包含除数字、字符、$、_ 之外的字符',
  SNAKE_CASE: '输入大写蛇式(SNAKE_CASE)标识符，需要符合编程语言规范, 不能包含除数字、字符、$、_ 之外的字符',
  snake_case: '输入小写蛇式(snake_case)标识符，需要符合编程语言规范, 不能包含除数字、字符、$、_ 之外的字符',
};

export const NameTooltipSimple: Record<NameCase, string> = {
  CamelCase: '输入大写驼峰式(CamelCase)标识符',
  camelCase: '输入小写驼峰式(camelCase)标识符',
  SNAKE_CASE: '输入大写蛇式(SNAKE_CASE)标识符',
  snake_case: '输入小写蛇式(snake_case)标识符',
};
