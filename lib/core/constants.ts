import { NameCase, VersionStatus } from './types';

export const UntitledInCamelCase = 'untitled';
export const UntitledInUpperCamelCase = 'Untitled';
export const UntitledInUpperCase = 'UNTITLED';
export const UntitledInHumanReadable = '未命名';

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

export const VersionStatusMap: Record<VersionStatus, string> = {
  [VersionStatus.PUBLISHED]: '已发布',
  [VersionStatus.UNPUBLISHED]: '未发布',
};

export const VersionStatusColor: Record<VersionStatus, string> = {
  [VersionStatus.PUBLISHED]: 'var(--vd-color-success-700)',
  [VersionStatus.UNPUBLISHED]: 'gray',
};
