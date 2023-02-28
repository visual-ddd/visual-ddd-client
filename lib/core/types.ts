/**
 * 标识符命名规则
 */
export type NameCase = 'CamelCase' | 'camelCase' | 'SNAKE_CASE' | 'snake_case';

export enum VersionStatus {
  UNPUBLISHED = 1,
  PUBLISHED = 2,
}

export interface IUser {
  id: string;
  name: string;
  avatar?: string;
}
