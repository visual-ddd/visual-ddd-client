export interface UbiquitousLanguageItem {
  /**
   * 唯一 id
   */
  uuid: string;

  /**
   * 概念
   */
  conception: string;

  /**
   * 英文名
   */
  englishName: string;

  /**
   * 定义
   */
  definition: string;

  /**
   * 约束
   */
  restraint: string;

  /**
   * 举例
   */
  example: string;
}

export interface IUbiquitousLanguageModel {
  /**
   * 只读模式
   */
  readonly readonly: boolean;
  readonly list: UbiquitousLanguageItem[];
  readonly selecting: string[];

  setFilter(params: { value: string }): void;

  isEditing(id: string, key: keyof UbiquitousLanguageItem): boolean;

  setEditing(params: { id: string; key: keyof UbiquitousLanguageItem; editing: boolean }): void;

  setSelecting(ids: string[]): void;

  updateItem(params: { uuid: string; key: keyof UbiquitousLanguageItem; value: string }): void;

  addItem(order?: 'push' | 'unshift'): void;

  removeItem(params: { uuid: string }): void;

  removeSelecting(): void;
}
