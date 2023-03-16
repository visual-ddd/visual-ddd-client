/**
 * 销毁函数
 */
export type DisposerFunction = () => void;

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

export interface IAwarenessRegistry<T> {
  /**
   * 设置状态
   * @param state
   */
  setState(state: T): void;

  getState(): T | undefined;

  /**
   * 远程状态
   */
  readonly remoteStates: { user?: IUser; state?: T }[];
}

export type MakeOptional<T, Keys extends keyof T> = Omit<T, Keys> & Partial<Pick<T, Keys>>;
